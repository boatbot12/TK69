from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
import random
from apps.users.models import User
from apps.campaigns.models import Campaign, CampaignApplication
from apps.finance.models import Wallet, Transaction, PlatformRevenue
from apps.finance.services import PayoutService

class Command(BaseCommand):
    help = 'Seed financial mock data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('🌱 Seeding financial data...')
        
        # 1. Get or Create Users (Influencers)
        influencers = []
        for i in range(1, 6):
            user, _ = User.objects.get_or_create(
                username=f'influencer{i}',
                defaults={
                    'email': f'inf{i}@test.com',
                    'display_name': f'Influencer {i} Pro',
                    'status': 'APPROVED',
                    'line_user_id': f'U1234567890{i}'
                }
            )
            # Ensure Wallet exists
            Wallet.objects.get_or_create(user=user)
            influencers.append(user)
            
        # 2. Create Campaigns
        brands = ['Samsung', 'Loreal', 'Nike', 'Uniqlo', 'Starbucks']
        campaigns = []
        for brand in brands:
            campaign, _ = Campaign.objects.get_or_create(
                title=f'{brand} Summer Campaign 2026',
                defaults={
                    'brand_name': brand,
                    'budget': Decimal(random.randint(5000, 50000)),
                    'status': 'OPEN',
                    'description': 'Promote our new summer collection.',
                    'application_deadline': timezone.now().date() + timezone.timedelta(days=7),
                    'content_deadline': timezone.now().date() + timezone.timedelta(days=14),
                    'script_deadline': timezone.now().date() + timezone.timedelta(days=10),
                    'draft_deadline': timezone.now().date() + timezone.timedelta(days=12),
                    'final_deadline': timezone.now().date() + timezone.timedelta(days=21),
                }
            )
            campaigns.append(campaign)
            
        # 3. Create Applications (Jobs)
        
        # Set 3A: Pending Payouts (Ready to Pay)
        for i in range(3):
            app, created = CampaignApplication.objects.get_or_create(
                campaign=random.choice(campaigns),
                user=random.choice(influencers),
                defaults={
                    'status': 'COMPLETED'  # UI will show as Pending Payout
                }
            )
            if not created:
                app.status = 'COMPLETED'
                app.save()
            self.stdout.write(f'  -> Created Pending Payout: {app.campaign.title} ({app.user.display_name})')

        # Set 3B: Already Paid (Historical Data)
        for i in range(5):
            app = CampaignApplication.objects.create(
                campaign=random.choice(campaigns),
                user=random.choice(influencers),
                status='COMPLETED'
            )
            
            # Process Payout
            try:
                slip_id = f'KBANK-{random.randint(100000, 999999)}'
                PayoutService.confirm_payout(
                    job_application=app,
                    proof_reference_id=slip_id,
                    admin_user=None  # System action
                )
                self.stdout.write(f'  -> Processed Payout: {app.campaign.title} - Slip: {slip_id}')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to process payout: {e}'))

        self.stdout.write(self.style.SUCCESS('✅ Financial seed data created successfully!'))
