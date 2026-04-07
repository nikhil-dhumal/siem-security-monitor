import os
import yaml
import random
import time
import requests
import socket
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

AGENT_CONFIG_PATH = os.getenv("AGENT_CONFIG_PATH", "configs/workstation.yaml")
AGGREGATOR = os.getenv("AGGREGATOR", "http://localhost:8001/ingest")

with open(AGENT_CONFIG_PATH) as f:
    agent_config = yaml.safe_load(f)

agent_type = agent_config.get("type")
log_rate_per_sec = agent_config.get("log_rate_per_sec", 1)
log_category_weights = agent_config.get("log_category_weights", {})
log_probabilities = agent_config.get("log_probabilities", {})


def choose_category():
    categories = list(log_category_weights.keys())
    weights = list(log_category_weights.values())
    return random.choices(categories, weights=weights, k=1)[0]


def choose_log_type(category):
    types = list(log_probabilities[category].keys())
    probs = list(log_probabilities[category].values())
    return random.choices(types, weights=probs, k=1)[0]


def send_log(log):
    try:
        requests.post(AGGREGATOR, json={"log": log}, timeout=1)
    except Exception as e:
        print(f"Failed to send log to {AGGREGATOR}: {e}")


def main():
    interval = 1.0 / log_rate_per_sec
    while True:
        category = choose_category()
        log_type = choose_log_type(category)
        generator = GENERATOR_MAP.get(category)
        if generator:
            log = generator(log_type, agent_type, hostname)
            send_log(log)
        time.sleep(interval)


if __name__ == "__main__":
    main()
