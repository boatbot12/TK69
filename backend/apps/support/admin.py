from django.contrib import admin
from .models import SupportTicket

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'user', 'topic', 'status', 'created_at')
    list_filter = ('status', 'topic', 'created_at')
    search_fields = ('subject', 'description', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'github_issue_url', 'attachments')
    
    ordering = ('-created_at',)
