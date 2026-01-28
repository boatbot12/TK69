from django.core.management.base import BaseCommand
from apps.campaigns.models import Campaign
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Seed mock campaigns with images'

    def handle(self, *args, **options):
        campaigns = [
            {
                'title': 'รีวิวเซรั่มหน้าใส Seoul Glow',
                'description': 'ต้องการ Influencer สาย Beauty รีวิวเซรั่มตัวใหม่ เน้นงานผิวธรรมชาติ',
                'full_description': 'รายละเอียดงาน:\n1. ถ่ายรูปคู่กับสินค้า 2 รูป\n2. เขียนแคปชั่นรีวิวความรู้สึกหลังใช้\n3. โพสต์ลง Instagram และ Facebook\n\nสิ่งที่ได้รับ: ค่าตอบแทน + สินค้าฟรี',
                'brand_name': 'Seoul Glow',
                'brand_logo': 'mock/beauty.jpg',
                'budget': 1500.00,
                'location': 'Bangkok / Online',
                'followers_required': 1000,
                'deadline_days': 7,
                'status': 'OPEN',
                'req': {'gender': 'Female', 'age_range': '20-30'}
            },
            {
                'title': 'Unboxing หูฟังไร้สาย SonicBoom',
                'description': 'หาคนชอบฟังเพลง รีวิวหูฟัง True Wireless เสียงดี เบสหนัก',
                'full_description': 'รีวิวหูฟัง SonicBoom X1\n- เน้นฟีเจอร์ตัดเสียงรบกวน\n- ทดสอบไมค์โครโฟน\n- ความสบายในการสวมใส่\n\nต้องทำคลิปสั้นลง TikTok/Reels ความยาว 1 นาที',
                'brand_name': 'SonicBoom',
                'brand_logo': 'mock/gadget.jpg',
                'budget': 3000.00,
                'location': 'Online',
                'followers_required': 5000,
                'deadline_days': 5,
                'status': 'OPEN',
                'req': {'platform': 'TikTok'}
            },
            {
                'title': 'พากินคาเฟ่ Minimalist Cafe',
                'description': 'สาย Cafe Hopping ห้ามพลาด! รีวิวคาเฟ่บรรยากาศมินิมอล กาแฟอร่อย',
                'full_description': 'เชิญชวน Influencer สายคาเฟ่ มาถ่ายรูปเช็คอินที่ร้าน\n- ฟรีเครื่องดื่มและขนม 1 เซ็ต\n- ค่าเดินทาง 500 บาท\n- ต้องโพสต์รูปสวยๆ 5 รูปขึ้นไป',
                'brand_name': 'Minimalist Cafe',
                'brand_logo': 'mock/cafe.jpg',
                'budget': 500.00,
                'location': 'Ari, Bangkok',
                'followers_required': 500,
                'deadline_days': 3,
                'status': 'OPEN',
                'req': {'style': 'Minimal'}
            }
        ]

        for camp in campaigns:
            if Campaign.objects.filter(title=camp['title']).exists():
                self.stdout.write(self.style.WARNING(f'Campaign "{camp["title"]}" already exists. Skipping.'))
                continue

            app_date = date.today() + timedelta(days=camp['deadline_days'])
            content_date = app_date + timedelta(days=7)

            Campaign.objects.create(
                title=camp['title'],
                description=camp['description'],
                full_description=camp['full_description'],
                brand_name=camp['brand_name'],
                brand_logo=camp['brand_logo'],
                budget=camp['budget'],
                location=camp['location'],
                followers_required=camp['followers_required'],
                application_deadline=app_date,
                content_deadline=content_date,
                status=camp['status'],
                requirements=camp['req']
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Created campaign: {camp["title"]}'))
