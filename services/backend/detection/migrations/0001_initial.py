from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='RuleConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rule_id', models.CharField(max_length=64, unique=True)),
                ('name', models.CharField(max_length=128)),
                ('description', models.TextField(blank=True)),
                ('severity', models.CharField(default='medium', max_length=32)),
                ('enabled', models.BooleanField(default=True)),
                ('threshold', models.IntegerField(blank=True, null=True)),
                ('window_seconds', models.IntegerField(blank=True, null=True)),
                ('parameters', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={'ordering': ['rule_id']},
        ),
    ]
