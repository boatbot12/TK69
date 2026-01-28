import os
from django.core.management.base import BaseCommand
from django.core.files import File
from django.utils import timezone
from apps.campaigns.models import Campaign
from apps.finance.models import Transaction, PlatformRevenue
from datetime import timedelta

from django.conf import settings

class Command(BaseCommand):
    help = 'Seed professional mock campaigns for client demo'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Seeding professional campaigns...')
        
        today = timezone.localdate()
        base_path = settings.BASE_DIR / 'seed_media'
        
        # 1. Clean up existing campaigns/applications/finance data except Vessi
        old_campaigns = Campaign.objects.exclude(brand_name__iexact='Vessi')
        
        # Delete related finance data protected by PROTECT
        PlatformRevenue.objects.filter(job__campaign__in=old_campaigns).delete()
        Transaction.objects.filter(job__campaign__in=old_campaigns).delete()

        count = old_campaigns.count()
        old_campaigns.delete()
        self.stdout.write(f'🗑️ Deleted {count} old campaigns and related data (Vessi preserved)')

        # 2. Define Campaign Data
        campaigns_data = [
            {
                'title': "Gentlewoman Canvas Tote - City Style",
                'brand_name': "Gentlewoman",
                'description': "Showcase how you style our iconic Canvas Tote in your everyday life.",
                'full_description': "We're looking for fashion-forward influencers to creations content with our signature Canvas Tote.\n\nRequirement:\n1. 1x Reel (15-30s) showing OOTD with the bag.\n2. 2x High-quality photos on Instagram.\n\nLocation: Anywhere in Thailand.",
                'budget': 5000.00,
                'followers_required': 5000,
                'location': "Bangkok / Online",
                'application_deadline': today + timedelta(days=14),
                'content_deadline': today + timedelta(days=28),
                'status': 'OPEN',
                'cover_path': str(base_path / 'covers' / 'gentlewoman_cover.png'),
                'logo_path': str(base_path / 'logos' / 'gentlewoman_logo.png')
            },
            {
                'title': "Shibuya Honey Toast - Sweet Moments",
                'brand_name': "After You",
                'description': "Share your sweet moments with After You's legendary Shibuya Honey Toast.",
                'full_description': "Visit any After You branch and capture the indulgence of our signature Honey Toast.\n\nRequirement:\n1. 1x TikTok/Reels showing the pouring of honey/syrup.\n2. 1x Photo post with a review of the experience.\n\nLocation: Any After You branch.",
                'budget': 2500.00,
                'followers_required': 3000,
                'location': "Any After You branch",
                'application_deadline': today + timedelta(days=7),
                'content_deadline': today + timedelta(days=14),
                'status': 'OPEN',
                'cover_path': str(base_path / 'covers' / 'after_you_cover.png'),
                'logo_path': str(base_path / 'logos' / 'after_you_logo.png')
            },
            {
                'title': "Dyson Airwrap - Hair Goals",
                'brand_name': "Dyson",
                'description': "Show your hair transformation using the Dyson Airwrap multi-styler.",
                'full_description': "We're looking for beauty and lifestyle influencers to demonstrate the power of Dyson Airwrap.\n\nRequirement:\n1. 1x Video tutorial (IG/TikTok) showing before and after.\n2. 3x Close-up photos of your styled hair.\n\nLocation: Online/Home.",
                'budget': 12000.00,
                'followers_required': 20000,
                'location': "Home / Online",
                'application_deadline': today + timedelta(days=10),
                'content_deadline': today + timedelta(days=25),
                'status': 'OPEN',
                'cover_path': str(base_path / 'covers' / 'dyson_cover.png'),
                'logo_path': str(base_path / 'logos' / 'dyson_logo.png')
            },
            {
                'title': "GrabFood - Everyday Essentials",
                'brand_name': "Grab Thailand",
                'description': "Review your favorite meal from GrabFood and show how it saves your day.",
                'full_description': "Order your favorite dish via GrabFood and share why it's your go-to service.\n\nRequirement:\n1. 1x Story with tracking window.\n2. 1x Photo of the meal with the Grab bag visible.\n\nLocation: Bangkok / Online.",
                'budget': 4000.00,
                'followers_required': 10000,
                'location': "Bangkok / Online",
                'application_deadline': today + timedelta(days=5),
                'content_deadline': today + timedelta(days=12),
                'status': 'OPEN',
                'cover_path': str(base_path / 'covers' / 'grab_cover.png'),
                'logo_path': str(base_path / 'logos' / 'grab_logo.png')
            }
        ]

        for data in campaigns_data:
            cover_path = data.pop('cover_path')
            logo_path = data.pop('logo_path')
            
            campaign = Campaign.objects.create(**data)
            
            # Use Django's File to handle the upload from local path
            if os.path.exists(cover_path):
                with open(cover_path, 'rb') as f:
                    campaign.cover_image.save(os.path.basename(cover_path), File(f), save=False)
            
            if os.path.exists(logo_path):
                with open(logo_path, 'rb') as f:
                    campaign.brand_logo.save(os.path.basename(logo_path), File(f), save=False)
            
            campaign.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Created: {campaign.title}'))

        self.stdout.write(self.style.SUCCESS('✨ Finished seeding professional campaigns!'))
