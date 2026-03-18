import psycopg2
from config import POSTGRES_CONFIG

conn = psycopg2.connect(**POSTGRES_CONFIG)
conn.autocommit = True


def insert_alert(alert):
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO alerts(type, category, severity, timestamp, source_ip, details)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            alert.get("type"),
            alert.get("category"),
            alert.get("severity"),
            alert.get("timestamp"),
            alert.get("src_ip"),
            alert.get("details"),
        ),
    )

    cur.close()
