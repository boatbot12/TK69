import os
import django
import sys

# Add the project root to python path
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.campaigns.models import Campaign
from apps.api.serializers import CampaignListSerializer

try:
    print("Checking Campaigns...")
    campaigns = Campaign.objects.all()
    count = campaigns.count()
    print(f"Found {count} campaigns")
    
    if count > 0:
        print("Attempting serialization...")
        # Mock request context if needed by serializer (e.g. for absolute URLs)
        # But here we pass None to see if it crashes basic serialization
        # Wait, get_user_status uses request.user.
        # We should handle request being None in serializer.
        from unittest.mock import Mock
        request = Mock()
        request.user.is_authenticated = False
        
        serializer = CampaignListSerializer(campaigns, many=True, context={'request': request})
        data = serializer.data
        print("Serialization SUCCESS!")
        print(f"Serialized {len(data)} items")
    else:
        print("No campaigns to serialize.")

except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
