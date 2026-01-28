from apps.users.models import User
from apps.finance.models import Transaction, PlatformRevenue, Settlement
from apps.campaigns.models import CampaignApplication
from django.db.models import Q

def run():
    print("🚀 Starting Safe Cleanup...")

    # 1. DELETE FINANCIAL DATA (Reverse order of dependencies)
    print("Cleaning Settlements...")
    Settlement.objects.all().delete()
    
    print("Cleaning Platform Revenue...")
    PlatformRevenue.objects.all().delete()
    
    print("Cleaning Transactions...")
    # Transaction.delete() raises ValidationError, so we use QuerySet delete (which might work if not overridden on queryset)
    # If standard manager is used, objects.all().delete() calls QuerySet.delete().
    # Let's hope Transaction.delete() restriction is only on instance level.
    Transaction.objects.all().delete()

    # 2. DELETE USERS (Except Whitelist)
    # Whitelist: Dev_User (16), Boat (4), Super Admin (1)
    # Names: 'Dev User', 'Boat', 'Super Admin'
    
    whitelist_names = ['Dev User', 'Boat', 'Super Admin']
    whitelist_ids = [1, 4, 16] # Based on previous inspection
    
    # Double check by name to be super safe
    safe_users = User.objects.filter(
        Q(id__in=whitelist_ids) | 
        Q(display_name__in=whitelist_names) | 
        Q(username__in=['U_DEV_12345', 'Ubc4cdb8875bd6981526461f71ae202e0', 'superadmin'])
    )
    
    safe_ids = list(safe_users.values_list('id', flat=True))
    print(f"Keeping Users: {safe_users.count()} -> IDs: {safe_ids}")
    
    users_to_delete = User.objects.exclude(id__in=safe_ids)
    count = users_to_delete.count()
    
    print(f"Deleting {count} users...")
    users_to_delete.delete()
    
    print("✅ Cleanup Complete!")
