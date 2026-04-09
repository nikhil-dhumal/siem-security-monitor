from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='LogEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(blank=True, null=True)),
                ('host', models.CharField(blank=True, max_length=255, null=True)),
                ('category', models.CharField(blank=True, max_length=100, null=True)),
                ('event_type', models.CharField(blank=True, max_length=100, null=True)),
                ('outcome', models.CharField(blank=True, max_length=50, null=True)),
                ('user', models.CharField(blank=True, max_length=255, null=True)),
                ('src_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('dst_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('src_port', models.IntegerField(blank=True, null=True)),
                ('dst_port', models.IntegerField(blank=True, null=True)),
                ('pid', models.IntegerField(blank=True, null=True)),
                ('command', models.TextField(blank=True, null=True)),
                ('file_path', models.TextField(blank=True, null=True)),
                ('proto', models.CharField(blank=True, max_length=10, null=True)),
                ('domain', models.CharField(blank=True, max_length=255, null=True)),
                ('raw_log', models.TextField(blank=True, null=True)),
                ('agent_id', models.CharField(blank=True, max_length=255, null=True)),
                ('agent_type', models.CharField(blank=True, max_length=100, null=True)),
                ('ingested_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={'ordering': ['-timestamp']},
        ),
    ]
