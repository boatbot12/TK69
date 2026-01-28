from rest_framework import serializers
from .models import SupportTicket

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ['id', 'topic', 'subject', 'description', 'attachments', 'status', 'github_issue_url', 'created_at']
        read_only_fields = ['id', 'attachments', 'status', 'github_issue_url', 'created_at']
