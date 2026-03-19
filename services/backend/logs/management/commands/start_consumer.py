from django.core.management.base import BaseCommand
from logs.services.consumer import start_consumer


class Command(BaseCommand):
    help = "Start the Redis stream consumer to ingest logs into the database"

    def handle(self, *args, **options):
        self.stdout.write("Starting Redis stream consumer...")
        start_consumer()