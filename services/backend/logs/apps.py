from django.apps import AppConfig


class LogsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name               = 'logs'

    def ready(self):
        # Import signals so @receiver decorators are registered.
        # Without this line, log_saved() never fires.
        import logs.signals  # noqa: F401