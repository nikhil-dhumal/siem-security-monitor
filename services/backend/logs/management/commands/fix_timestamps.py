from django.core.management.base import BaseCommand
from logs.models import Log
from django.utils.dateparse import parse_datetime
from django.utils import timezone

class Command(BaseCommand):
    help = 'Fix logs with missing timestamps by using ingested_at'

    def handle(self, *args, **options):
        logs_to_fix = Log.objects.filter(timestamp__isnull=True)
        total = logs_to_fix.count()
        self.stdout.write(f"Fixing {total} logs with None timestamps...")
        
        count = 0
        batch_size = 100
        
        for i, log in enumerate(logs_to_fix):
            if log.raw and log.raw.get('ingested_at'):
                try:
                    log.timestamp = parse_datetime(log.raw['ingested_at'])
                    log.save(update_fields=['timestamp'])
                    count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error updating log {log.id}: {e}"))
            
            if (i + 1) % batch_size == 0:
                self.stdout.write(f"Progress: {i + 1}/{total}")
        
        self.stdout.write(self.style.SUCCESS(f"Updated {count} logs"))
        remaining = Log.objects.filter(timestamp__isnull=True).count()
        self.stdout.write(f"Remaining logs with no timestamp: {remaining}")
