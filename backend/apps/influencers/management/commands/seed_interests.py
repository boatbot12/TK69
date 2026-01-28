from django.core.management.base import BaseCommand
from apps.influencers.models import Interest

class Command(BaseCommand):
    help = 'Seeds initial interest categories'

    def handle(self, *args, **options):
        # Define the new 10 interest categories requested by user
        interests_data = [
            # 1. Food & Drink
            { 
                'id': 'food_drink', 
                'name': 'Food & Drink', 
                'name_th': 'อาหารและเครื่องดื่ม', 
                'icon': '🍱', 
                'image': 'interests/food_drink.png', 
                'order': 1 
            },
            # 2. Lifestyle
            { 
                'id': 'lifestyle', 
                'name': 'Lifestyle', 
                'name_th': 'ไลฟ์สไตล์', 
                'icon': '✨', 
                'image': 'interests/lifestyle.png', 
                'order': 2 
            },
            # 3. Travel
            { 
                'id': 'travel', 
                'name': 'Travel', 
                'name_th': 'ท่องเที่ยว', 
                'icon': '🗺️', 
                'image': 'interests/travel.png', 
                'order': 3 
            },
            # 4. Beauty
            { 
                'id': 'beauty', 
                'name': 'Beauty', 
                'name_th': 'ความงาม', 
                'icon': '💄', 
                'image': 'interests/beauty.png', 
                'order': 4 
            },
            # 5. Fashion
            { 
                'id': 'fashion', 
                'name': 'Fashion', 
                'name_th': 'แฟชั่น', 
                'icon': '🧥', 
                'image': 'interests/fashion.png', 
                'order': 5 
            },
            # 6. Real Estate
            { 
                'id': 'real_estate', 
                'name': 'Real Estate', 
                'name_th': 'อสังหาริมทรัพย์', 
                'icon': '🏡', 
                'image': 'interests/real_estate.png', 
                'order': 6 
            },
            # 7. Personal Finance
            { 
                'id': 'finance', 
                'name': 'Personal Finance', 
                'name_th': 'การเงินส่วนบุคคล', 
                'icon': '💹', 
                'image': 'interests/finance.png', 
                'order': 7 
            },
            # 8. Live Streamers
            { 
                'id': 'live_stream', 
                'name': 'Live Streamers', 
                'name_th': 'ไลฟ์สตรีมเมอร์', 
                'icon': '🎙️', 
                'image': 'interests/live_stream.png', 
                'order': 8 
            },
            # 9. Health
            { 
                'id': 'health', 
                'name': 'Health', 
                'name_th': 'สุขภาพ', 
                'icon': '🧘', 
                'image': 'interests/health.png', 
                'order': 9 
            },
            # 10. Pet
            { 
                'id': 'pet', 
                'name': 'Pet', 
                'name_th': 'สัตว์เลี้ยง', 
                'icon': '🐾', 
                'image': 'interests/pet.png', 
                'order': 10 
            },
        ]

        # Use update_or_create to prevent deleting existing relationships (Cascade Delete)
        for data in interests_data:
            interest_id = data.pop('id')
            Interest.objects.update_or_create(
                id=interest_id,
                defaults=data
            )
            self.stdout.write(self.style.SUCCESS(f"Seeded interest: {data['name']}"))
            
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(interests_data)} interests'))
