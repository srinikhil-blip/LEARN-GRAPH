"""
LearnGraph — Celery Application
Configures the Celery distributed task queue backed by Redis.
"""

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

# ── App Instantiation ─────────────────────────────────────────────────────────

celery_app = Celery(
    "learngraph",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.workers.tasks.email_tasks",
        "app.workers.tasks.sync_tasks",
    ],
)

# ── Serialisation ─────────────────────────────────────────────────────────────

celery_app.conf.update(
    # Serialisation
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    # Timezone
    timezone="UTC",
    enable_utc=True,
    # Result expiry (1 day)
    result_expires=86_400,
    # Reliability
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    # Retry policy
    task_max_retries=3,
    task_default_retry_delay=60,  # seconds
    # Soft / hard time limits (seconds)
    task_soft_time_limit=300,
    task_time_limit=600,
)

# ── Task Routing ──────────────────────────────────────────────────────────────
# Tasks are routed to specialised queues so email, AI, and graph workers can
# be scaled independently.

celery_app.conf.task_routes = {
    "app.workers.tasks.email_tasks.*": {"queue": "email_queue"},
    "app.workers.tasks.ai_tasks.*": {"queue": "ai_queue"},
    "app.workers.tasks.graph_tasks.*": {"queue": "graph_queue"},
    "app.workers.tasks.sync_tasks.*": {"queue": "graph_queue"},
}

celery_app.conf.task_default_queue = "default"

# ── Beat Schedule — Periodic Tasks ────────────────────────────────────────────

celery_app.conf.beat_schedule = {
    # Drain PostgreSQL transactional outbox into Neo4j every 10 seconds
    "drain-outbox-batch": {
        "task": "app.workers.tasks.sync_tasks.process_outbox_batch",
        "schedule": 10.0,
        "options": {"queue": "graph_queue"},
    },
    # Reconcile database drift between PostgreSQL and Neo4j every day at 03:00 UTC
    "nightly-drift-reconciliation": {
        "task": "app.workers.tasks.sync_tasks.reconcile_all_drift",
        "schedule": crontab(hour=3, minute=0),
        "options": {"queue": "graph_queue"},
    },
    # Send weekly learning-progress reports every Sunday at 09:00 UTC
    "weekly-progress-reports": {
        "task": "app.workers.tasks.email_tasks.send_weekly_progress_reports",
        "schedule": crontab(hour=9, minute=0, day_of_week="sunday"),
        "options": {"queue": "email_queue"},
    },
    # Prune expired notification records every day at 02:00 UTC
    "daily-notification-cleanup": {
        "task": "app.workers.tasks.notification_tasks.cleanup_expired_notifications",
        "schedule": crontab(hour=2, minute=0),
        "options": {"queue": "default"},
    },
    # Refresh AI recommendation cache every 6 hours
    "refresh-recommendations": {
        "task": "app.workers.tasks.ai_tasks.refresh_recommendation_cache",
        "schedule": crontab(minute=0, hour="*/6"),
        "options": {"queue": "ai_queue"},
    },
}
