from django import template
from apps.finance.services import PayoutService
from decimal import Decimal

register = template.Library()

@register.simple_tag
def get_finance_stats():
    """Fetch financial statistics for the dashboard."""
    try:
        stats = PayoutService.get_dashboard_stats()
        # Pre-format as strings to avoid template filter issues
        return {
            'total_gmv': "{:,.2f}".format(stats['total_gmv']),
            'total_revenue': "{:,.2f}".format(stats['total_revenue']),
            'pending_payout_count': stats['pending_payout_count'],
            'pending_payout_amount': "{:,.2f}".format(stats['pending_payout_amount']),
            'total_payouts_made': "{:,.2f}".format(stats['total_payouts_made']),
            'total_payout_count': stats['total_payout_count'],
        }
    except Exception as e:
        print(f"DEBUG: Error in get_finance_stats: {e}")
        return {
            'total_gmv': "0.00",
            'total_revenue': "0.00",
            'pending_payout_count': 0,
            'pending_payout_amount': "0.00",
            'total_payouts_made': "0.00",
            'total_payout_count': 0,
        }

@register.simple_tag
def get_pending_payouts_list():
    """Fetch the list of pending payouts."""
    try:
        from apps.finance.models import PlatformRevenue
        jobs = PayoutService.get_pending_payouts()
        results = []
        for job in jobs[:10]:  # Limit to 10 for dashboard
            breakdown = PlatformRevenue.calculate_breakdown(job.campaign.budget)
            results.append({
                'id': job.id,
                'id_short': str(job.id)[:8],
                'campaign_title': job.campaign.title,
                'influencer_name': job.user.display_name or job.user.username,
                'gross_amount': "{:,.2f}".format(job.campaign.budget),
                'net_payout': "{:,.2f}".format(breakdown['net_payout']),
                'updated_at': job.updated_at,
            })
        return results
    except Exception as e:
        print(f"DEBUG: Error in get_pending_payouts_list: {e}")
        return []
