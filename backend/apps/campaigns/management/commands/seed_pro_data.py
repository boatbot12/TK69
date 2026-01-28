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
                'title': "รีวิวถุงผ้า Gentlewoman Canvas Tote ในลุค Everyday Look",
                'brand_name': "Gentlewoman",
                'description': "แชร์ไอเดียการแมตช์ถุงผ้าสุดฮิต Gentlewoman เข้ากับสไตล์การแต่งตัวในชีวิตประจำวันของคุณ",
                'full_description': "เรากำลังมองหา Influencer สายแฟชั่นมาสร้างสรรค์คอนเทนต์กับถุงผ้า Canvas Tote อันเป็นเอกลักษณ์ของเรา\n\nเงื่อนไขงาน:\n1. 1x คลิปวิดีโอสั้น (15-30 วินาที) โชว์ OOTD คู่กับกระเป๋า\n2. 2x รูปภาพคุณภาพสูงลง Instagram\n\nสถานที่: ที่ใดก็ได้ในประเทศไทย",
                'budget': 5000.00,
                'followers_required': 5000,
                'location': "กรุงเทพฯ / ออนไลน์",
                'application_deadline': today + timedelta(days=14),
                'content_deadline': today + timedelta(days=28),
                'status': 'OPEN',
                'cover_path': str(base_path / 'covers' / 'gentlewoman_cover.png'),
                'logo_path': str(base_path / 'logos' / 'gentlewoman_logo.png')
            },
            {
                'title': "Shibuya Honey Toast - ความสุขแสนหวานที่ After You",
                'brand_name': "After You",
                'description': "ร่วมแชร์ช่วงเวลาแสนหวานกับเมนูตำนาน Shibuya Honey Toast จาก After You",
                'full_description': "ไปที่สาขา After You ใดก็ได้แล้วถ่ายภาพความน่าทานของ Honey Toast อันเป็นเอกลักษณ์ของเรา\n\nเงื่อนไขงาน:\n1. 1x คลิป TikTok/Reels โชว์จังหวะราดน้ำผึ้ง/ไซรัป\n2. 1x โพสต์รูปภาพพร้อมรีวิวความประทับใจ\n\nสถานที่: ร้าน After You ทุกสาขา",
                'budget': 2500.00,
                'followers_required': 3000,
                'location': "ร้าน After You ทุกสาขา",
                'application_deadline': today + timedelta(days=7),
                'content_deadline': today + timedelta(days=14),
                'status': 'OPEN',
                'cover_path': str(base_path / 'covers' / 'after_you_cover.png'),
                'logo_path': str(base_path / 'logos' / 'after_you_logo.png')
            },
            {
                'title': "Dyson Airwrap - เนรมิตทรงผมสวยได้ทุกวัน",
                'brand_name': "Dyson",
                'description': "โชว์การเปลี่ยนลุคทรงผมด้วยชุดอุปกรณ์จัดแต่งทรงผม Dyson Airwrap multi-styler",
                'full_description': "เรากำลังมองหา Influencer สาย Beauty และ Lifestyle มาสาธิตประสิทธิภาพของ Dyson Airwrap\n\nเงื่อนไขงาน:\n1. 1x คลิปวิดีโอสอนทำผม (IG/TikTok) โชว์ Before & After\n2. 3x รูปภาพซูมความสวยของทรงผมที่จัดแต่งแล้ว\n\nสถานที่: ออนไลน์/บ้าน",
                'budget': 12000.00,
                'followers_required': 20000,
                'location': "บ้าน / ออนไลน์",
                'application_deadline': today + timedelta(days=10),
                'content_deadline': today + timedelta(days=25),
                'status': 'OPEN',
                'cover_path': str(base_path / 'covers' / 'dyson_cover.png'),
                'logo_path': str(base_path / 'logos' / 'dyson_logo.png')
            },
            {
                'title': "GrabFood - สั่งของอร่อยได้ทุกวันแบบคุ้มค่า",
                'brand_name': "Grab Thailand",
                'description': "รีวิวเมนูโปรดจาก GrabFood และโชว์ว่าบริการของเราช่วยให้ชีวิตคุณง่ายขึ้นอย่างไร",
                'full_description': "สั่งเมนูโปรดของคุณผ่าน GrabFood และแชร์ว่าทำไมแอปนี้ถึงเป็นแอปโปรดของคุณ\n\nเงื่อนไขงาน:\n1. 1x Story โชว์หน้าจอติดตามสถานะการส่งอาหาร\n2. 1x รูปภาพอาหารพร้อมให้เห็นกระเป๋า Grab ในภาพ\n\nสถานที่: กรุงเทพฯ / ออนไลน์",
                'budget': 4000.00,
                'followers_required': 10000,
                'location': "กรุงเทพฯ / ออนไลน์",
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
