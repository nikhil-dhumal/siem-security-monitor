import os
import redis

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)


def publish(stream_name, data):
    return redis_client.xadd(stream_name, data)


def consume(
    stream_name,
    group_name,
    consumer_name,
    count=10,
    block=5000,
):
    return redis_client.xreadgroup(
        groupname=group_name,
        consumername=consumer_name,
        streams={stream_name: ">"},
        count=count,
        block=block,
    )


def ack(stream_name, group_name, message_id):
    redis_client.xack(stream_name, group_name, message_id)


def create_group(stream_name, group_name):
    try:
        redis_client.xgroup_create(
            name=stream_name, groupname=group_name, id="0", mkstream=True
        )
    except redis.exceptions.ResponseError as e:
        if "BUSYGROUP" in str(e):
            pass
        else:
            raise
