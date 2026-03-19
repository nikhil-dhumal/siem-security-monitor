import json
from redis_client import read_events, acknowledge, publish_alert, init_group
from postgres_client import insert_alert
from rules import run_rules


def process_event(event):

    alert = run_rules(event)

    if alert:
        print("ALERT:", alert)

        insert_alert(alert)
        publish_alert(alert)


def run_worker():

    print("Starting Detection Worker...")

    init_group()

    while True:

        messages = read_events()

        for stream, events in messages:

            for message_id, data in events:

                try:
                    event = data  # already dict from redis
                    process_event(event)

                    acknowledge(message_id)

                except Exception as e:
                    print("Error processing event:", e)


if __name__ == "__main__":
    run_worker()
