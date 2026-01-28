"""
Influencer Profile and Interest models.
"""

from django.db import models
from django.conf import settings
from django.core.validators import RegexValidator, MinValueValidator


def id_card_upload_path(instance, filename):
    """Generate upload path for ID card images."""
    return f'influencers/{instance.user.id}/id_cards/{filename}'


def bank_book_upload_path(instance, filename):
    """Generate upload path for bank book images."""
    return f'influencers/{instance.user.id}/bank_book/{filename}'


class Interest(models.Model):
    """
    Interest categories for influencers.
    """
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100, help_text="English name", verbose_name="ชื่อ (อังกฤษ)")
    name_th = models.CharField(max_length=100, help_text="Thai name", verbose_name="ชื่อ (ไทย)")
    icon = models.CharField(max_length=10, help_text="Emoji icon", verbose_name="ไอคอน")
    image = models.ImageField(upload_to='interests/', null=True, blank=True, help_text="Creative background image", verbose_name="รูปภาพ")
    is_active = models.BooleanField(default=True, verbose_name="ใช้งาน")
    order = models.PositiveIntegerField(default=0, verbose_name="ลำดับ")
    
    class Meta:
        verbose_name = 'หมวดหมู่ความสนใจ'
        verbose_name_plural = 'หมวดหมู่ความสนใจ'
        ordering = ['order', 'name']
    
    def __str__(self):
        return f"{self.icon} {self.name}"


class InfluencerProfile(models.Model):
    """
    Extended profile for influencers.
    Contains personal info, address, work conditions, and documents.
    """
    
    phone_validator = RegexValidator(
        regex=r'^0\d{9}$',
        message='Phone number must be 10 digits starting with 0'
    )
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    # Personal Information
    full_name_th = models.CharField(
        max_length=100,
        help_text="Full name in Thai",
        verbose_name="ชื่อ-นามสกุล (ไทย)"
    )
    phone = models.CharField(
        max_length=10,
        validators=[phone_validator],
        help_text="10-digit phone number",
        verbose_name="เบอร์โทรศัพท์"
    )
    email = models.EmailField(
        blank=True,
        help_text="Email address (optional)",
        verbose_name="อีเมล"
    )
    date_of_birth = models.DateField(
        help_text="Date of birth",
        verbose_name="วันเกิด"
    )
    
    # Thai Address (split into columns)
    house_no = models.CharField(
        max_length=50,
        help_text="บ้านเลขที่",
        verbose_name="บ้านเลขที่"
    )
    village = models.CharField(
        max_length=100,
        blank=True,
        help_text="หมู่บ้าน/อาคาร",
        verbose_name="หมู่บ้าน/อาคาร"
    )
    moo = models.CharField(
        max_length=20,
        blank=True,
        help_text="หมู่ที่",
        verbose_name="หมู่ที่"
    )
    soi = models.CharField(
        max_length=100,
        blank=True,
        help_text="ซอย",
        verbose_name="ซอย"
    )
    road = models.CharField(
        max_length=100,
        blank=True,
        help_text="ถนน",
        verbose_name="ถนน"
    )
    sub_district = models.CharField(
        max_length=100,
        help_text="ตำบล/แขวง",
        verbose_name="ตำบล/แขวง"
    )
    district = models.CharField(
        max_length=100,
        help_text="อำเภอ/เขต",
        verbose_name="อำเภอ/เขต"
    )
    province = models.CharField(
        max_length=100,
        help_text="จังหวัด",
        verbose_name="จังหวัด"
    )
    zipcode = models.CharField(
        max_length=5,
        help_text="รหัสไปรษณีย์",
        verbose_name="รหัสไปรษณีย์"
    )
    
    # Work Conditions
    allow_boost = models.BooleanField(
        default=False,
        help_text="Allow brands to boost posts",
        verbose_name="รับงาน Boost"
    )
    boost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Boost price in THB",
        verbose_name="ราคา Boost"
    )
    allow_original_file = models.BooleanField(
        default=False,
        help_text="Provide original/raw files",
        verbose_name="ให้ไฟล์ต้นฉบับ"
    )
    original_file_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Original file price in THB",
        verbose_name="ราคาไฟล์ต้นฉบับ"
    )
    
    accept_gifted_video = models.BooleanField(
        default=False,
        help_text="Willing to do video for high-value product without cash payment",
        verbose_name="ยินดีรับสินค้าเพื่อทำ Video (No Cash)"
    )
    accept_affiliate = models.BooleanField(
        default=False,
        help_text="Willing to work on affiliate/commission basis",
        verbose_name="ยินดีรับงานแบบ Affiliate"
    )
    
    # Interests
    interests = models.ManyToManyField(
        Interest,
        related_name='influencers',
        help_text="Selected interest categories",
        verbose_name="ความสนใจ"
    )
    
    # Documents
    id_card_front = models.ImageField(
        upload_to=id_card_upload_path,
        help_text="ID card front image",
        verbose_name="รูปบัตรประชาชน"
    )
    identification_number = models.CharField(
        max_length=13,
        blank=True,
        help_text="13-digit ID card number",
        verbose_name="เลขบัตรประจำตัวประชาชน"
    )
    bank_book = models.ImageField(
        upload_to=bank_book_upload_path,
        help_text="Bank book first page",
        verbose_name="หน้าสมุดบัญชี"
    )
    bank_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Bank Name (e.g. SCB, KBANK)",
        verbose_name="ชื่อธนาคาร"
    )
    bank_account_number = models.CharField(
        max_length=20,
        blank=True,
        help_text="Bank Account Number",
        verbose_name="เลขที่บัญชี"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="สร้างเมื่อ")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="แก้ไขเมื่อ")
    
    class Meta:
        verbose_name = 'ข้อมูลอินฟลูเอนเซอร์'
        verbose_name_plural = 'ข้อมูลอินฟลูเอนเซอร์'
    
    def __str__(self):
        return f"{self.full_name_th} ({self.user.display_name})"
    
    @property
    def full_address(self):
        """Get formatted full address."""
        parts = [self.house_no]
        if self.village:
            parts.append(self.village)
        if self.moo:
            parts.append(f"หมู่ {self.moo}")
        if self.soi:
            parts.append(f"ซอย {self.soi}")
        if self.road:
            parts.append(f"ถนน {self.road}")
        parts.extend([
            f"ตำบล/แขวง {self.sub_district}",
            f"อำเภอ/เขต {self.district}",
            f"จังหวัด {self.province}",
            self.zipcode
        ])
        return ' '.join(parts)
    
    @property
    def interest_list(self):
        """Get list of interest IDs."""
        return list(self.interests.values_list('id', flat=True))


class SocialPlatformAccount(models.Model):
    """
    Connected social media accounts for influencers.
    Stores profile data fetched from external APIs.
    """
    
    PLATFORM_CHOICES = [
        ('youtube', 'YouTube'),
        ('tiktok', 'TikTok'),
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
        ('lemon8', 'Lemon8'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='social_accounts'
    )
    platform = models.CharField(
        max_length=20,
        choices=PLATFORM_CHOICES,
        db_index=True,
        verbose_name="แพลตฟอร์ม"
    )
    platform_user_id = models.CharField(
        max_length=255,
        blank=True,
        help_text="Unique ID from platform",
        verbose_name="Platform User ID"
    )
    username = models.CharField(
        max_length=255,
        help_text="Display handle (e.g., @username)",
        verbose_name="ชื่อผู้ใช้"
    )
    profile_url = models.URLField(
        max_length=500,
        help_text="Link to the profile",
        verbose_name="ลิงก์โปรไฟล์"
    )
    profile_picture_url = models.URLField(
        max_length=1000,
        blank=True,
        help_text="Profile picture URL",
        verbose_name="รูปโปรไฟล์"
    )
    followers_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of followers",
        verbose_name="ผู้ติดตาม"
    )
    following_count = models.PositiveIntegerField(
        default=0,
        blank=True,
        help_text="Number of following",
        verbose_name="กำลังติดตาม"
    )
    posts_count = models.PositiveIntegerField(
        default=0,
        blank=True,
        help_text="Number of posts/videos",
        verbose_name="โพสต์"
    )

    is_verified = models.BooleanField(
        default=False,
        help_text="Platform verified badge",
        verbose_name="ยืนยันตัวตน"
    )
    connected_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="เชื่อมต่อเมื่อ"
    )
    last_synced_at = models.DateTimeField(
        auto_now=True,
        verbose_name="ซิงค์ล่าสุด"
    )
    
    class Meta:
        verbose_name = 'บัญชี Social Media'
        verbose_name_plural = 'บัญชี Social Media'
        unique_together = ['user', 'platform']
        ordering = ['platform']
    
    def __str__(self):
        return f"{self.get_platform_display()}: {self.username}"
    
    @property
    def followers_formatted(self):
        """Format followers count for display (e.g., 1.2K, 3.4M)."""
        count = self.followers_count
        if count >= 1_000_000:
            return f"{count / 1_000_000:.1f}M"
        elif count >= 1_000:
            return f"{count / 1_000:.1f}K"
        return str(count)


class BlacklistedInfluencer(models.Model):
    """
    Internal blacklist of influencers with bad history.
    Used to flag risky applicants during approval.
    """
    name = models.CharField(max_length=255, blank=True, verbose_name="ชื่อ-นามสกุล")
    address = models.TextField(blank=True, verbose_name="ที่อยู่")
    phone = models.CharField(max_length=20, blank=True, verbose_name="เบอร์โทรศัพท์")
    line_id = models.CharField(max_length=100, blank=True, verbose_name="Line ID")
    tiktok_name = models.CharField(max_length=255, blank=True, verbose_name="TikTok Name")
    tiktok_url = models.URLField(max_length=500, blank=True, verbose_name="TikTok URL")
    reason = models.TextField(
        blank=True, 
        default="ประวัติไม่ดีกับบริษัท (Blacklist)", 
        verbose_name="เหตุผลที่ติดแบล็คลิสต์"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="วันที่เพิ่ม")

    class Meta:
        verbose_name = 'คนติดแบล็คลิสต์'
        verbose_name_plural = 'รายชื่อแบล็คลิสต์'
        ordering = ['-created_at']

    def __str__(self):
        return self.tiktok_name or self.name or f"Blacklist #{self.id}"
