
import pymysql
import datetime
import json

try:
    print('Connecting to database...')
    conn = pymysql.connect(
        host='153.92.15.26',
        port=3306,
        user='u906486159_admin',
        password='9|mJyeOtf2=',
        database='u906486159_KT69'
    )
    cursor = conn.cursor()
    print('✅ Connected to database')

    # Note: Images are downloaded to /app/media/mock/ by entrypoint.sh
    # We use relative paths stored in DB: mock/beauty.jpg, etc.
    
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
        },
        {
            'title': 'ถ่ายแบบเสื้อผ้าแฟชั่น Summer Collection',
            'description': 'หานางแบบถ่าย Lookbook เสื้อผ้าคอลเลคชั่นหน้าร้อน สดใส ร่าเริง',
            'full_description': 'ถ่ายแบบชุดไปทะเล ชุดว่ายน้ำ และชุดลำลอง\n- สถานที่: คาเฟ่ย่านพระราม 9\n- เวลา: 10:00 - 16:00 น.\n- ได้ไฟล์รูปทั้งหมดไปลงพอร์ตได้',
            'brand_name': 'Summer Vibes',
            'brand_logo': 'mock/fashion.jpg',
            'budget': 4500.00,
            'location': 'Rama 9, Bangkok',
            'followers_required': 2000,
            'deadline_days': 10,
            'status': 'OPEN',
            'req': {'height': '160+', 'style': 'Fashion'}
        },
        {
            'title': 'รีวิวบุฟเฟต์ปิ้งย่างเกาหลี',
            'description': 'สายกินเชิญทางนี้! รีวิวร้านปิ้งย่างเปิดใหม่ หมูหมักซอสสูตรพิเศษ',
            'full_description': 'ทานฟรีไม่อั้น 2 ท่าน! เพียงทำคลิปรึวิวลง TikTok/Reels\n- เน้นถ่ายบรรยากาศร้านและตอนปิ้งย่าง\n- ต้องพูดถึงโปรโมชั่นเปิดร้านใหม่ ลด 20%',
            'brand_name': 'Korean Grill',
            'brand_logo': 'mock/food.jpg',
            'budget': 1000.00,
            'location': 'Siam Square',
            'followers_required': 800,
            'deadline_days': 4,
            'status': 'OPEN',
            'req': {'type': 'Foodie'}
        }
    ]

    print('🚀 Inserting mock campaigns with images...')

    # Clear existing mock data to avoid duplicates/outdated entries
    print('🧹 Cleaning up old data...')
    cursor.execute('DELETE FROM campaigns_campaign')
    cursor.execute('DELETE FROM campaigns_campaignapplication') # Clear applications too to avoid FK errors
    conn.commit()
    print('✅ Old campaigns cleared')

    for camp in campaigns:
        app_date = datetime.date.today() + datetime.timedelta(days=camp['deadline_days'])
        content_date = app_date + datetime.timedelta(days=7)
        req_json = json.dumps(camp['req'])
        
        sql = '''
            INSERT INTO campaigns_campaign (
                title, description, full_description, brand_name, brand_logo,
                budget, location, followers_required, 
                application_deadline, content_deadline, 
                status, requirements, created_at, updated_at,
                script_deadline, draft_deadline, final_deadline
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s,
                %s, %s, NOW(), NOW(),
                DATE_ADD(%s, INTERVAL -5 DAY),
                DATE_ADD(%s, INTERVAL -3 DAY),
                %s
            )
        '''
        cursor.execute(sql, (
            camp['title'], camp['description'], camp['full_description'], camp['brand_name'],
            camp['brand_logo'],
            camp['budget'], camp['location'], camp['followers_required'],
            app_date, content_date,
            camp['status'], req_json,
            content_date, content_date, content_date
        ))
        print(f"✅ Created: {camp['title']}")

    conn.commit()
    print('✨ All campaigns created successfully!')
    cursor.close()
    conn.close()

except Exception as e:
    print(f'❌ Error: {e}')
