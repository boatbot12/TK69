from django.contrib import admin
from .models import Interest, InfluencerProfile, SocialPlatformAccount, BlacklistedInfluencer


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    """Admin interface for Interest categories."""
    
    list_display = ['id', 'image_preview', 'name', 'name_th', 'is_active', 'order']
    list_filter = ['is_active']
    list_editable = ['is_active', 'order']
    search_fields = ['name', 'name_th']
    ordering = ['order']
    
    def image_preview(self, obj):
        if obj.image:
            from django.utils.html import format_html
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" />', obj.image.url)
        return "-"
    image_preview.short_description = 'รูปภาพ'


@admin.register(InfluencerProfile)
class InfluencerProfileAdmin(admin.ModelAdmin):
    """Admin interface for Influencer Profiles."""
    
    list_display = [
        'user', 'full_name_th', 
        'phone', 'province', 'created_at'
    ]
    list_filter = ['province', 'allow_boost', 'allow_original_file', 'created_at']
    search_fields = [
        'full_name_th', 'phone', 
        'user__display_name', 'user__line_user_id'
    ]
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['interests']
    
    fieldsets = (
        ('ผู้ใช้', {'fields': ('user',)}),
        ('ข้อมูลส่วนตัว', {
            'fields': (
                'full_name_th', 
                'phone', 'email', 'date_of_birth'
            )
        }),
        ('ที่อยู่', {
            'fields': (
                'house_no', 'village', 'moo', 'soi', 'road',
                'sub_district', 'district', 'province', 'zipcode'
            )
        }),
        ('เงื่อนไขการทำงาน', {
            'fields': (
                'allow_boost', 'boost_price',
                'allow_original_file', 'original_file_price',
                'accept_gifted_video', 'accept_affiliate'
            )
        }),
        ('ความสนใจ', {'fields': ('interests',)}),
        ('เอกสาร', {
            'fields': ('id_card_front', 'bank_book')
        }),
        ('เวลาที่บันทึก', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SocialPlatformAccount)
class SocialPlatformAccountAdmin(admin.ModelAdmin):
    """Admin interface for connected Social Media Accounts."""
    
    list_display = [
        'user', 'platform', 'username', 
        'followers_count', 'is_verified', 'last_synced_at'
    ]
    list_filter = ['platform', 'is_verified', 'connected_at']
    search_fields = ['username', 'user__display_name', 'platform_user_id']
    readonly_fields = ['connected_at', 'last_synced_at']


@admin.register(BlacklistedInfluencer)
class BlacklistedInfluencerAdmin(admin.ModelAdmin):
    """Admin interface for Blacklisted Influencers."""
    
    list_display = [
        'id', 'tiktok_name', 'name', 'phone', 
        'line_id', 'reason_short', 'created_at'
    ]
    list_filter = ['created_at']
    search_fields = [
        'name', 'phone', 'line_id', 
        'tiktok_name', 'tiktok_url', 'address'
    ]
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('ข้อมูลหลัก', {
            'fields': ('tiktok_name', 'tiktok_url', 'name')
        }),
        ('ข้อมูลติดต่อ', {
            'fields': ('phone', 'line_id', 'address')
        }),
        ('เหตุผล', {
            'fields': ('reason',)
        }),
        ('ข้อมูลระบบ', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def reason_short(self, obj):
        """Display truncated reason."""
        if obj.reason and len(obj.reason) > 30:
            return obj.reason[:30] + '...'
        return obj.reason or '-'
    reason_short.short_description = 'เหตุผล'
