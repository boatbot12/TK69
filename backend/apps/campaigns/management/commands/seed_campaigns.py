from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.campaigns.models import Campaign
from datetime import timedelta
import random

class Command(BaseCommand):
    help = 'Seed 7 mock campaigns'

    def handle(self, *args, **options):
        self.stdout.write('Seeding campaigns...')
        
        today = timezone.localdate()
        
        # Campaign 1: Open, High Budget
        Campaign.objects.create(
            title="Summer Collection Launch",
            description="Review our new summer clothing line. Focus on vibrant colors and beach vibes.",
            full_description="We are launching our 2026 Summer Collection. We need influencers to showcase our swimwear and casual wear. Must post 1 Reel and 3 Stories.",
            brand_name="SunnyWear",
            budget=5000,
            location="Bangkok / Beach",
            followers_required=10000,
            application_deadline=today + timedelta(days=10),
            content_deadline=today + timedelta(days=20),
            status='OPEN'
        )

        # Campaign 2: Tech, Open
        Campaign.objects.create(
            title="Wireless Earbuds Review",
            description="Unboxing and sound test of the new SoundMax Pro.",
            full_description="Highlight noise cancellation features and battery life. Honest review preferred.",
            brand_name="SoundMax",
            budget=3500,
            location="Anywhere",
            followers_required=5000,
            application_deadline=today + timedelta(days=5),
            content_deadline=today + timedelta(days=15),
            status='OPEN'
        )

        # Campaign 3: Food, Draft (Not visible to users usually, but good for admin)
        Campaign.objects.create(
            title="Minimalist Cafe Visit",
            description="Visit our new branch at Ari. Take aesthetic photos.",
            full_description="Focus on the interior design and our signature latte.",
            brand_name="Bean Minimal",
            budget=1500,
            location="Ari, Bangkok",
            followers_required=1000,
            application_deadline=today + timedelta(days=7),
            content_deadline=today + timedelta(days=14),
            status='DRAFT'
        )

        # Campaign 4: Health, In Progress
        Campaign.objects.create(
            title="30-Day Fitness Challenge",
            description="Join our protein shake challenge. Post weekly updates.",
            full_description="We provide the protein powder. You provide the sweat.",
            brand_name="FitLife",
            budget=8000,
            location="Gym / Home",
            followers_required=20000,
            application_deadline=today - timedelta(days=5), # Passed
            content_deadline=today + timedelta(days=25),
            status='IN_PROGRESS'
        )

        # Campaign 5: Travel, Closed
        Campaign.objects.create(
            title="Luxury Hotel Staycation",
            description="2-night stay at our riverside hotel.",
            full_description="Experience luxury. Breakfast included.",
            brand_name="River Grand",
            budget=15000,
            location="Bangkok",
            followers_required=50000,
            application_deadline=today - timedelta(days=20),
            content_deadline=today - timedelta(days=10),
            status='CLOSED'
        )

        # Campaign 6: Skincare, Open
        Campaign.objects.create(
            title="Glow Serum Campaign",
            description="Show your morning routine with our Glow Serum.",
            full_description="Focus on texture and immediate results.",
            brand_name="Glow Lab",
            budget=2500,
            location="Home",
            followers_required=3000,
            application_deadline=today + timedelta(days=12),
            content_deadline=today + timedelta(days=22),
            status='OPEN'
        )

        # Campaign 7: Gaming, Open
        Campaign.objects.create(
            title="Mobile RPG Launch Stream",
            description="Stream 1 hour of gameplay.",
            full_description="Play our new RPG. Show gacha mechanics and combat.",
            brand_name="GameConnect",
            budget=10000,
            location="Online",
            followers_required=15000,
            application_deadline=today + timedelta(days=3),
            content_deadline=today + timedelta(days=10),
            status='OPEN'
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded 7 campaigns.'))
