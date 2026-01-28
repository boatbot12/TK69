from django.contrib import admin
from .models import Campaign, CampaignApplication, CampaignInsightMetric


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    """Admin interface for Campaigns."""
    
    list_display = [
        'title', 'brand_name', 'status', 
        'application_deadline', 'content_deadline', 
        'budget', 'created_at'
    ]
    list_filter = ['status', 'created_at', 'application_deadline']
    search_fields = ['title', 'brand_name', 'description']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'application_deadline'
    
    fieldsets = (
        ('ข้อมูลพื้นฐาน', {
            'fields': ('title', 'brand_name', 'brand_logo', 'cover_image', 'status', 'location', 'followers_required', 'brief_url')
        }),
        ('รายละเอียด', {
            'fields': ('description', 'full_description')
        }),
        ('งบประมาณ', {
            'fields': ('budget',)
        }),
        ('กำหนดการ', {
            'fields': (
                'application_deadline', 
                'script_deadline', 
                'draft_deadline', 
                'final_deadline',
                'insight_deadline',
                'content_deadline'
            )
        }),
        ('ข้อกำหนด', {
            'fields': ('requirements',),
            # 'classes': ('collapse',)  <-- Removed to make it visible by default
        }),
        ('เวลาที่บันทึก', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CampaignApplication)
class CampaignApplicationAdmin(admin.ModelAdmin):
    """Admin interface for Campaign Applications."""
    
    list_display = [
        'user', 'campaign', 'status', 
        'current_stage', 'applied_at', 'updated_at'
    ]
    list_filter = ['status', 'campaign', 'applied_at']
    search_fields = [
        'user__display_name', 'user__line_user_id', 
        'campaign__title', 'campaign__brand_name'
    ]
    list_editable = ['status']
    readonly_fields = ['applied_at', 'updated_at', 'formatted_insight_data', 'submission_data_readonly', 'formatted_insight_files_preview']
    exclude = ['submission_data', 'insight_data']
    raw_id_fields = ['user', 'campaign']
    
    def submission_data_readonly(self, obj):
        import json
        from django.utils.html import format_html
        if not obj.submission_data:
            return "-"
        
        try:
            content = json.dumps(obj.submission_data, indent=2, ensure_ascii=False)
            style = "white-space: pre-wrap; font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px solid #ddd;"
            return format_html('<pre style="{}">{}</pre>', style, content)
        except:
            return "Error parsing JSON"

    submission_data_readonly.short_description = "Workflow Submissions"
    
    def formatted_insight_data(self, obj):
        import json
        from django.utils.html import format_html
        notMsg = "No Insight Data"
        if not obj.insight_data:
            return notMsg
        
        try:
            # Pretty print JSON
            content = json.dumps(obj.insight_data, indent=2, ensure_ascii=False)
            # Basic highlighting for key metrics
            style = "white-space: pre-wrap; font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px solid #ddd;"
            return format_html('<pre style="{}">{}</pre>', style, content)
        except:
            return "Error parsing JSON"
    
    formatted_insight_data.short_description = "AI Insight Analysis (JSON)"
    
    def formatted_insight_files_preview(self, obj):
        from django.utils.html import format_html
        if not obj.insight_files:
            # Fallback to single image if no files list
            if obj.insight_image:
                 return format_html('<a href="{}" target="_blank"><img src="{}" style="max-height: 200px; border-radius: 8px;" /></a>', obj.insight_image, obj.insight_image)
            return "No files uploaded"
            
        html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">'
        for url in obj.insight_files:
            html += f'''
                <a href="{url}" target="_blank" style="display: block; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                    <img src="{url}" style="width: 100%; height: 200px; object-fit: cover;" />
                </a>
            '''
        html += '</div>'
        return format_html(html)

    formatted_insight_files_preview.short_description = "Insight Files Grid"

    fieldsets = (
        ('ใบสมัคร', {
            'fields': ('user', 'campaign', 'status', 'application_note')
        }),
        ('การชำระเงิน', {
            'fields': ('payment_slip',),
            'description': 'อัปโหลดสลิปหลังจากโอนเงินให้ Influencer แล้ว'
        }),
        ('งานที่ส่ง', {
            'fields': ('submission_data_readonly',)
        }),
        ('AI Insight Analysis', {
            'fields': ('formatted_insight_data', 'formatted_insight_files_preview', 'insight_image', 'insight_note'),
            'classes': ('collapse', 'open'),
        }),
        ('ส่วนของผู้ดูแล', {
            'fields': ('admin_notes',)
        }),
        ('เวลาที่บันทึก', {
            'fields': ('applied_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    @admin.action(description='⚠️ Force Delete (Superuser Only)')
    def force_delete_application(self, request, queryset):
        """
        Force delete applications ensuring all related immutable financial records 
        are cleaned up first to prevent 500 errors.
        """
        if not request.user.is_superuser:
            self.message_user(request, '❌ เฉพาะ Superuser เท่านั้นที่สามารถทำรายการนี้ได้', level='error')
            return

        from apps.finance.models import Transaction, PlatformRevenue
        
        success_count = 0
        deleted_tx_count = 0
        deleted_rev_count = 0
        
        for app in queryset:
            try:
                # 1. Delete Platform Revenue records first (Protected)
                rev_qs = PlatformRevenue.objects.filter(job=app)
                rev_count = rev_qs.count()
                if rev_count > 0:
                    rev_qs.delete()
                    deleted_rev_count += rev_count
                    
                # 2. Delete Transactions linked to this job (Protected & Immutable)
                # Use queryset.delete() to bypass model.delete() validation
                tx_qs = Transaction.objects.filter(job=app)
                tx_count = tx_qs.count()
                if tx_count > 0:
                    tx_qs.delete() 
                    deleted_tx_count += tx_count
                
                # 3. Finally delete the application
                app.delete()
                success_count += 1
                
            except Exception as e:
                self.message_user(request, f'❌ Error deleting app {app.id}: {str(e)}', level='error')
                return

        self.message_user(
            request, 
            f'✅ Force Deleted {success_count} applications. '
            f'(Cleaned up {deleted_rev_count} Revenue records, {deleted_tx_count} Transactions)'
        )

    actions = [
        'approve_applications', 'reject_applications', 'approve_script', 
        'approve_draft', 'approve_final_video', 'approve_insight', 
        'mark_payment_transferred', 'force_delete_application'
    ]
    
    
    @admin.action(description='อนุมัติใบสมัครที่เลือก')
    def approve_applications(self, request, queryset):
        from apps.users.services import LineMessagingService
        
        applications = queryset.filter(status='WAITING')
        success_count = 0
        notify_count = 0
        
        for app in applications:
            old_status = app.status
            app.status = 'APPROVED'
            app.save()
            success_count += 1
            
            result = LineMessagingService.send_campaign_status_notification(app, old_status, 'APPROVED')
            if result.get('success'):
                notify_count += 1
        
        self.message_user(request, f'✅ อนุมัติ {success_count} ใบสมัคร และส่งแจ้งเตือน LINE {notify_count} รายการ')
    
    @admin.action(description='ปฏิเสธใบสมัครที่เลือก')
    def reject_applications(self, request, queryset):
        from apps.users.services import LineMessagingService
        
        applications = queryset.filter(status='WAITING')
        success_count = 0
        notify_count = 0
        
        for app in applications:
            old_status = app.status
            app.status = 'REJECTED'
            app.save()
            success_count += 1
            
            result = LineMessagingService.send_campaign_status_notification(app, old_status, 'REJECTED')
            if result.get('success'):
                notify_count += 1
        
        self.message_user(request, f'❌ ปฏิเสธ {success_count} ใบสมัคร และส่งแจ้งเตือน LINE {notify_count} รายการ')
    
    @admin.action(description='อนุมัติสคริปต์ที่เลือก')
    def approve_script(self, request, queryset):
        from apps.users.services import LineMessagingService
        
        applications = queryset.filter(status='SUBMITTED_SCRIPT')
        success_count = 0
        notify_count = 0
        
        for app in applications:
            old_status = app.status
            app.status = 'SCRIPT_APPROVED'
            app.save()
            success_count += 1
            
            result = LineMessagingService.send_campaign_status_notification(app, old_status, 'SCRIPT_APPROVED')
            if result.get('success'):
                notify_count += 1
        
        self.message_user(request, f'✅ อนุมัติสคริปต์ {success_count} รายการ และส่งแจ้งเตือน LINE {notify_count} รายการ')
    
    @admin.action(description='อนุมัติดราฟท์ที่เลือก')
    def approve_draft(self, request, queryset):
        from apps.users.services import LineMessagingService
        
        applications = queryset.filter(status='SUBMITTED_DRAFT')
        success_count = 0
        notify_count = 0
        
        for app in applications:
            old_status = app.status
            app.status = 'DRAFT_APPROVED'
            app.save()
            success_count += 1
            
            result = LineMessagingService.send_campaign_status_notification(app, old_status, 'DRAFT_APPROVED')
            if result.get('success'):
                notify_count += 1
        
        self.message_user(request, f'✅ อนุมัติดราฟท์ {success_count} รายการ และส่งแจ้งเตือน LINE {notify_count} รายการ')

    @admin.action(description='อนุมัติวิดีโอ (รอ Insight)')
    def approve_final_video(self, request, queryset):
        from apps.users.services import LineMessagingService
        
        applications = queryset.filter(status='SUBMITTED_FINAL')
        success_count = 0
        notify_count = 0
        
        for app in applications:
            old_status = app.status
            app.status = 'FINAL_APPROVED'
            app.save()
            success_count += 1
            
            result = LineMessagingService.send_campaign_status_notification(app, old_status, 'FINAL_APPROVED')
            if result.get('success'):
                notify_count += 1
        
        self.message_user(request, f'✅ อนุมัติวิดีโอ {success_count} รายการ (รอ Insight)')
    
    @admin.action(description='✓ อนุมัติ Insight (งานเสร็จสมบูรณ์)')
    def approve_insight(self, request, queryset):
        from apps.users.services import LineMessagingService
        
        applications = queryset.filter(status='SUBMITTED_INSIGHT')
        success_count = 0
        notify_count = 0
        
        for app in applications:
            old_status = app.status
            app.status = 'COMPLETED'
            app.save()
            success_count += 1
            
            result = LineMessagingService.send_campaign_status_notification(app, old_status, 'COMPLETED')
            if result.get('success'):
                notify_count += 1
        
        self.message_user(request, f'🎊 อนุมัติ Insight {success_count} รายการ (รอจ่ายเงิน)')
    
    @admin.action(description='💰 โอนเงินแล้ว')
    def mark_payment_transferred(self, request, queryset):
        from apps.users.services import LineMessagingService
        
        applications = queryset.filter(status='COMPLETED')
        success_count = 0
        notify_count = 0
        
        for app in applications:
            old_status = app.status
            app.status = 'PAYMENT_TRANSFERRED'
            app.save()
            success_count += 1
            
            result = LineMessagingService.send_campaign_status_notification(app, old_status, 'PAYMENT_TRANSFERRED')
            if result.get('success'):
                notify_count += 1
        
        self.message_user(request, f'💰 โอนเงิน {success_count} รายการ และส่งแจ้งเตือน LINE {notify_count} รายการ')


@admin.register(CampaignInsightMetric)
class CampaignInsightMetricAdmin(admin.ModelAdmin):
    """Admin interface for Campaign Insight Metrics."""
    list_display = [
        'application', 'total_views', 
        'total_likes', 'engagement_rate', 
        'cost_per_view', 'updated_at'
    ]
    list_filter = ['updated_at']
    search_fields = ['application__user__display_name', 'application__campaign__title']
    readonly_fields = ['updated_at']
    ordering = ['-updated_at']
    
    fieldsets = (
        ('Metrics', {
            'fields': (
                'application',
                'total_views',
                'total_likes',
                'total_comments',
                'total_shares'
            )
        }),
        ('Calculated KPI', {
            'fields': ('engagement_rate', 'cost_per_view'),
            'description': 'Engagement Rate = (Engagements/Views)*100<br>CPV = Budget/Views'
        }),
        ('Timestamp', {
            'fields': ('updated_at',)
        })
    )
