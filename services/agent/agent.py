import os
import yaml
import random
import time
import requests
import socket
import redis
import json
import threading
from datetime import datetime, timezone
from log_generators import (
    gen_auth_log,
    gen_web_access_log,
    gen_firewall_log,
    gen_dns_log,
    gen_process_execution_log,
    gen_file_access_log,
    gen_vpn_log,
)

GENERATOR_MAP = {
    "auth": gen_auth_log,
    "web": gen_web_access_log,
    "firewall": gen_firewall_log,
    "dns": gen_dns_log,
    "process": gen_process_execution_log,
    "file_access": gen_file_access_log,
    "vpn": gen_vpn_log,
}

hostname = socket.gethostname()

AGENT_ID = os.getenv("AGENT_ID", hostname)
AGENT_CONFIG_PATH = os.getenv("AGENT_CONFIG_PATH", "configs/workstation.yaml")
AGGREGATOR = os.getenv("AGGREGATOR", "http://localhost:8001/ingest")
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

with open(AGENT_CONFIG_PATH) as f:
    agent_config = yaml.safe_load(f)

agent_type = agent_config.get("type")
log_rate_per_sec = agent_config.get("log_rate_per_sec", 1) / 2  # Reduce speed by half
log_category_weights = agent_config.get("log_category_weights", {})
log_probabilities = agent_config.get("log_probabilities", {})

# Redis for config updates
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

is_running = threading.Event()
is_running.set()
DEFAULT_LOG_RATE_PER_SEC = agent_config.get("log_rate_per_sec", 1) / 2
DEFAULT_LOG_CATEGORY_WEIGHTS = log_category_weights.copy()
DEFAULT_LOG_PROBABILITIES = json.loads(json.dumps(log_probabilities))


def process_config_update(config_update):
    global log_probabilities, log_category_weights, log_rate_per_sec
    if 'log_probabilities' in config_update:
        log_probabilities = config_update['log_probabilities']
        print(f"Updated log_probabilities: {log_probabilities}")
    if 'log_category_weights' in config_update:
        log_category_weights = config_update['log_category_weights']
        print(f"Updated log_category_weights: {log_category_weights}")
    if 'log_rate_per_sec' in config_update:
        log_rate_per_sec = config_update['log_rate_per_sec'] / 2  # Keep the /2 reduction
        print(f"Updated log_rate_per_sec: {log_rate_per_sec}")


def process_control_update(control_update):
    action = control_update.get('action')
    template = control_update.get('template')
    print(f"Received control update: {action}, template={template}")

    if action == 'start':
        is_running.set()
        print("Agent starting log generation")
    elif action == 'stop':
        is_running.clear()
        print("Agent stopping log generation")
    elif action == 'reset':
        is_running.clear()
        log_category_weights.clear()
        log_category_weights.update(DEFAULT_LOG_CATEGORY_WEIGHTS)
        log_probabilities.clear()
        log_probabilities.update(DEFAULT_LOG_PROBABILITIES)
        log_rate_per_sec = DEFAULT_LOG_RATE_PER_SEC
        print("Agent reset to default configuration")
    elif template:
        # For template actions, simply resume generation if stopped
        is_running.set()
        print(f"Agent received simulation template: {template}")


def config_update_listener():
    """Listen for config and control updates via Redis pub/sub"""
    pubsub = redis_client.pubsub()
    pubsub.subscribe(f"config:{AGENT_ID}", 'simulation_config', 'simulation_control')
    
    print(f"Agent {AGENT_ID} listening for config and control updates...")
    for message in pubsub.listen():
        if message['type'] != 'message':
            continue
        try:
            payload = json.loads(message['data'])
            if message['channel'] == f"config:{AGENT_ID}" or message['channel'] == 'simulation_config':
                process_config_update(payload)
            elif message['channel'] == 'simulation_control':
                process_control_update(payload)
        except Exception as e:
            print(f"Error processing pubsub message: {e}")

# Start config listener in background thread
config_thread = threading.Thread(target=config_update_listener, daemon=True)
config_thread.start()


def choose_category():
    categories = list(log_category_weights.keys())
    weights = list(log_category_weights.values())
    return random.choices(categories, weights=weights, k=1)[0]


def choose_log_type(category):
    types = list(log_probabilities[category].keys())
    probs = list(log_probabilities[category].values())
    return random.choices(types, weights=probs, k=1)[0]


def generate_coordinates(log_text, log_type):
    iitb_lat = 19.135658054134453
    iitb_lon = 72.90819998371538
    campus_radius_km = 2
    
    is_suspicious = any(keyword in log_text.lower() for keyword in [
        "malicious", "suspicious", "failed", "denied", "blocked", "error",
        "invalid", "warning", "connection refused", "attack"
    ])
    
    if is_suspicious and random.random() < 0.7:
        lat = iitb_lat + random.uniform(-0.03, 0.03)
        lon = iitb_lon + random.uniform(-0.03, 0.03)
    else:
        lat = iitb_lat + random.uniform(-0.015, 0.015)
        lon = iitb_lon + random.uniform(-0.015, 0.015)
    
    return lat, lon


def send_log(log, category, log_type):
    lat, lon = generate_coordinates(log, log_type)
    payload = {
        "agent_id": AGENT_ID,
        "agent_type": agent_type,
        "host": hostname,
        "log": log,
        "category": category,
        "event_type": log_type,
        "latitude": lat,
        "longitude": lon,
    }
    try:
        requests.post(AGGREGATOR, json=payload, timeout=1)
    except Exception as e:
        print(f"Failed to send log: {e}")


def main():
    while True:
        is_running.wait()

        interval = 1.0 / log_rate_per_sec if log_rate_per_sec > 0 else 1.0
        category = choose_category()
        log_type = choose_log_type(category)
        generator = GENERATOR_MAP.get(category)
        if generator:
            log = generator(log_type, agent_type, hostname)
            send_log(log, category, log_type)
        time.sleep(interval)


if __name__ == "__main__":
    main()
