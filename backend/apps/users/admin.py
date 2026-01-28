from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""
    
    list_display = [
        'username', 'display_name', 'line_user_id', 
        'status', 'is_staff', 'created_at'
    ]
    list_filter = ['status', 'is_staff', 'is_superuser', 'created_at']
    search_fields = ['username', 'display_name', 'line_user_id', 'email']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('ข้อมูล LINE', {'fields': ('line_user_id', 'display_name', 'picture_url')}),
        ('สถานะ', {'fields': ('status', 'rejection_reason')}),
        ('ข้อมูลส่วนตัว', {'fields': ('first_name', 'last_name', 'email')}),
        ('สิทธิ์การใช้งาน', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('วันที่เกี่ยวข้อง', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'line_user_id'),
        }),
    )
    
    actions = ['approve_users', 'reject_users']
    
    @admin.action(description='อนุมัติผู้ใช้ที่เลือก')
    def approve_users(self, request, queryset):
        # Update status first
        count = queryset.update(status='APPROVED', rejection_reason='')
        
        # Send notifications
        from .services import LineMessagingService
        success_count = 0
        for user in queryset:
            result = LineMessagingService.send_approval_notification(user)
            if result.get('success'):
                success_count += 1
                
        self.message_user(request, f'อนุมัติ {count} ผู้ใช้เรียบร้อย ส่งแจ้งเตือนแล้ว {success_count} รายการ')
    
    @admin.action(description='ปฏิเสธผู้ใช้ที่เลือก')
    def reject_users(self, request, queryset):
        # Update status first
        count = queryset.update(status='REJECTED')
        
        # Send notifications
        from .services import LineMessagingService
        success_count = 0
        for user in queryset:
            result = LineMessagingService.send_rejection_notification(
                user, 
                user.rejection_reason or ''
            )
            if result.get('success'):
                success_count += 1
                
        self.message_user(request, f'ปฏิเสธ {count} ผู้ใช้เรียบร้อย ส่งแจ้งเตือนแล้ว {success_count} รายการ')
