from rest_framework import serializers
from .models import AdminLog
from apps.api.serializers import UserSerializer

class AdminLogSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    
    class Meta:
        model = AdminLog
        fields = [
            'id', 'actor', 'action_type', 'action_type_display',
            'target_model', 'target_id', 'target_str',
            'details', 'ip_address', 'created_at'
        ]
