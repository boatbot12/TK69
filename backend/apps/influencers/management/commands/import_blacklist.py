from django.core.management.base import BaseCommand
from apps.influencers.models import BlacklistedInfluencer

class Command(BaseCommand):
    help = 'Import blacklisted influencers from initial list'

    def handle(self, *args, **options):
        blacklist_data = [
            {"tiktok_name": "creammycmm", "tiktok_url": "https://www.tiktok.com/@creammycmm"},
            {"tiktok_name": "nxtmxn.tk.", "tiktok_url": "https://www.tiktok.com/@nxtmxn.tk."},
            {"tiktok_name": "guiitarna", "tiktok_url": "https://www.tiktok.com/@guiitarna"},
            {"tiktok_name": "thierapinkk", "tiktok_url": "https://www.tiktok.com/@thierapinkk"},
            {"tiktok_name": "rangsineechantawanitchakit", "tiktok_url": "https://www.tiktok.com/@rangsineechantawanitchakit"},
            {
                "name": "ลูกน้ำ (Bussakorn Suhans)", 
                "address": "LF Intertrade, 417/103 Green Condo, Don Mueang", 
                "phone": "0658989666", 
                "tiktok_name": "skinbynam", 
                "tiktok_url": "https://www.tiktok.com/@skinbynam"
            },
            {"tiktok_name": "nongaum_naja", "tiktok_url": "https://www.tiktok.com/nongaum_naja"},
            {"tiktok_name": "malamang_may", "tiktok_url": "https://www.tiktok.com/@malamang_may"},
            {"tiktok_name": "arachacherdchay", "tiktok_url": "https://www.tiktok.com/@arachacherdchay"},
            {"tiktok_name": "errth.wrr", "tiktok_url": "https://www.tiktok.com/@errth.wrr"},
            {"tiktok_name": "little.jasmine", "tiktok_url": "https://www.tiktok.com/@little.jasmine"},
            {"tiktok_name": "yy_12201", "tiktok_url": "https://www.tiktok.com/@yy_12201"},
            {"tiktok_name": "balobowww", "tiktok_url": "https://www.tiktok.com/@balobowww"},
            {
                "name": "มายด์ (Mind)", 
                "address": "Elio Del Moss, Phaholyothin, Bldg F, Chatuchak, BK", 
                "phone": "0650192305", 
                "line_id": "smile39170", 
                "tiktok_name": "@sasasmile", 
                "tiktok_url": "https://www.tiktok.com/@sasasmile"
            },
            {
                "name": "คิตตี้ (Kitty)", 
                "address": "Viranya Village, Wongwaen-Onnut, Prawet, BK", 
                "phone": "0804415992", 
                "line_id": "@449slozp", 
                "tiktok_name": "kittyivy_", 
                "tiktok_url": "https://www.tiktok.com/@kittyivy_"
            },
            {"tiktok_name": "ddaesomii", "tiktok_url": "https://www.tiktok.com/@ddaesomii"},
            {"tiktok_name": "falilimjubu", "tiktok_url": "https://www.tiktok.com/@falilimjubu"},
            {
                "name": "Kanoknat T.", 
                "address": "Dcondo Campus Resort, Khlong Nueng, Pathum Thani", 
                "phone": "0922466669", 
                "tiktok_name": "Guaitarna", 
                "tiktok_url": "https://www.tiktok.com/@guiitarna"
            },
            {
                "name": "กวิสรา อ่ำดอนกลอย", 
                "address": "Popular Condo C3, Pak Kret, Nonthaburi", 
                "phone": "0962913266", 
                "tiktok_name": "babydiary228", 
                "tiktok_url": "https://www.tiktok.com/@babydiary228"
            },
            {
                "name": "หนึ่งฤทัย สีหา", 
                "address": "Pruksa Village, Lam Luk Ka, Pathum Thani", 
                "phone": "0809352911"
            },
            {
                "name": "ศิริสิทธิ์ ฟองอาภา", 
                "address": "Phra Pradaeng, Samut Prakan", 
                "phone": "0641573093", 
                "tiktok_name": "tutasivas", 
                "tiktok_url": "https://www.tiktok.com/@tutasivas"
            },
            {
                "name": "ณัฐชยา กาฬสิงห์ (ไนซ์)", 
                "address": "Supalai Veranda Rama 9, Huai Khwang, BK", 
                "phone": "0849780321", 
                "line_id": "nicennk", 
                "tiktok_name": "nicencyy", 
                "tiktok_url": "https://www.tiktok.com/@nicencyy"
            },
            {
                "name": "นรี มณีสุวรรณสิน", 
                "address": "Wat Mai, Mueang Chanthaburi", 
                "phone": "0985497493", 
                "line_id": "kimkitsumi", 
                "tiktok_name": "kimmyoiu", 
                "tiktok_url": "https://www.tiktok.com/@kimmyoiu"
            },
            {
                "name": "ศิริลักษณ์ สินวรณ์", 
                "address": "Bung, Mueang Amnat Charoen", 
                "phone": "0918799977", 
                "tiktok_name": "ktuppp", 
                "tiktok_url": "https://www.tiktok.com/@ktuppp"
            },
            {
                "name": "มิ้น (Mint)", 
                "address": "Popular Condo C3, Pak Kret, Nonthaburi", 
                "phone": "0962913266", 
                "line_id": "22072542", 
                "tiktok_name": "Babydiary228", 
                "tiktok_url": "https://www.tiktok.com/@babydiary228"
            },
            {
                "name": "เช้น (พัทธมน อุ่นสกุลสุข)", 
                "address": "The Hub Apartment, Abac Bangna, Samut Prakan", 
                "phone": "0968037571", 
                "line_id": "Melodyz_st", 
                "tiktok_name": "saintststt", 
                "tiktok_url": "https://www.tiktok.com/@saintststt"
            },
            {
                "name": "สิบลเอกกำภรรพล คงคล้าย"
            }
        ]

        count = 0
        for data in blacklist_data:
            obj, created = BlacklistedInfluencer.objects.get_or_create(
                tiktok_url=data.get('tiktok_url', ''),
                phone=data.get('phone', ''),
                name=data.get('name', ''),
                defaults=data
            )
            if created:
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} blacklisted influencers'))
