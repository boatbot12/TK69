
import os
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def inspect_template():
    print("--- Inspecting app_index.html ---")
    file_path = 'apps/finance/templates/admin/finance/app_index.html'
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
            print(f"File size: {len(content)} bytes")
            
            # Check for suspicious substrings in the binary content
            suspicious = [b'\xe2\x80\x8b', b'\xc2\xa0'] # Zero-width space, non-breaking space
            for risk in suspicious:
                if risk in content:
                    print(f"WARNING: Found suspicious char {risk} in file!")
            
            # Decode and print lines around pending payouts
            text = content.decode('utf-8')
            lines = text.splitlines()
            for i, line in enumerate(lines):
                if 'pending_payout' in line or 'Total Payouts Made' in line:
                    print(f"Line {i+1}: {repr(line)}")
    except Exception as e:
        print(f"Error reading file: {e}")

def check_backend_data():
    print("\n--- Checking Backend Data ---")
    try:
        from apps.finance.services import PayoutService
        from apps.campaigns.models import CampaignApplication
        
        # Check Stats
        stats = PayoutService.get_dashboard_stats()
        print(f"Stats: {stats}")
        
        # Check Pending Jobs
        pending_qs = PayoutService.get_pending_payouts()
        print(f"Pending Jobs Query: {pending_qs.query}")
        print(f"Pending Jobs Count: {pending_qs.count()}")
        
        # Debug why count might be 0
        all_completed = CampaignApplication.objects.filter(status__in=['COMPLETED', 'READY_TO_PAY'])
        print(f"All COMPLETED/READY_TO_PAY count: {all_completed.count()}")
        
        for job in all_completed[:5]:
            print(f"Job {job.id}: {job.campaign.title} ({job.status})")

    except Exception as e:
        print(f"Error in backend check: {e}")

if __name__ == '__main__':
    inspect_template()
    check_backend_data()
