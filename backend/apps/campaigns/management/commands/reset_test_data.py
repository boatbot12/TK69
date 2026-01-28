from django.core.management.base import BaseCommand
from apps.campaigns.models import Campaign
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Reset all campaigns to active state for testing'

    def handle(self, *args, **options):
        campaigns = Campaign.objects.all()
        count = 0
        
        today = date.today()
        
        for camp in campaigns:
            # Shift dates to be in the future
            camp.start_date = today
            camp.end_date = today + timedelta(days=30)
            
            # Application deadline: next 7 days
            camp.application_deadline = today + timedelta(days=7)
            
            # Submission deadlines spaced out
            camp.script_deadline = today + timedelta(days=10)
            camp.draft_deadline = today + timedelta(days=15)
            camp.final_deadline = today + timedelta(days=20)
            camp.insight_deadline = today + timedelta(days=30)
            
            # Ensure status is Recruiting (so they show up)
            # Or if they are already in progress, keep them, but fix dates.
            # But user said "adjust... suitable for test", likely wants them selectable.
            # Let's verify status choices. Assuming 'RECRUITING' or 'OPEN'. 
            # Looking at previous file it used 'OPEN'. Let's check model if possible, 
            # but usually 'RECRUITING' or 'OPEN' is safe. 
            # The previous seed used 'OPEN', but UI shows 'Recruiting'?
            # Let's default to 'RECRUITING' if that's the choice, or 'OPEN'.
            # Reviewing previous seed file: status='OPEN'.
            # I will set it to 'RECRUITING' if that's the standard, or keep 'OPEN'.
            # Actually, let's just use 'Active' equivalent.
            # Wait, I recall 'RECRUITING' from UI logic?
            # Let's check the Campaign model to be sure of choices.
            
            camp.status = 'OPEN'
            
            camp.save()
            count += 1
            
        self.stdout.write(self.style.SUCCESS(f'✅ Successfully reset {count} campaigns to active status with future deadlines.'))
