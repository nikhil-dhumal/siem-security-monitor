from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('logs', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Alert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('rule', models.CharField(max_length=255)),
                ('severity', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')], max_length=20)),
                ('description', models.TextField()),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user', models.CharField(blank=True, max_length=255, null=True)),
                ('acknowledged', models.BooleanField(default=False)),
                ('log_event', models.ForeignKey(blank=True, null=True, on_delete=models.deletion.CASCADE, to='logs.logevent')),
            ],
            options={'ordering': ['-timestamp']},
        ),
        migrations.CreateModel(
            name='Incident',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('status', models.CharField(choices=[('open', 'Open'), ('investigating', 'Investigating'), ('resolved', 'Resolved'), ('closed', 'Closed')], default='open', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('alerts', models.ManyToManyField(to='alerts.Alert')),
            ],
        ),
    ]
