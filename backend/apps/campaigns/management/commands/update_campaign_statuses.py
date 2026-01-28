from django.core.management.base import BaseCommand
from apps.campaigns.models import Campaign
from django.utils import timezone

class Command(BaseCommand):
    help = 'Automatically update campaign statuses based on deadlines'

    def handle(self, *args, **options):
        self.stdout.write(f"[{timezone.now().isoformat()}] Starting campaign status update...")
        count = Campaign.update_all_statuses()
        self.stdout.write(self.style.SUCCESS(f"Successfully updated {count} campaign(s)"))
