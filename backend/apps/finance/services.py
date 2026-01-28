"""
Financial Services - ACID Payout Protocol.

Handles payment confirmation with atomic transactions to ensure
data consistency between status updates and financial records.
"""

from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from .models import Transaction, PlatformRevenue, Wallet


class PayoutService:
    """
    Service for handling influencer payouts with strict ACID compliance.
    Prevents "Ghost Updates" where status changes without financial records.
    """
    
    PLATFORM_FEE_RATE = Decimal('0.10')  # 10%
    VAT_RATE = Decimal('0.07')  # 7%
    WHT_RATE = Decimal('0.03')  # 3%
    
    @classmethod
    @transaction.atomic
    def confirm_payout(cls, job_application, proof_reference_id, include_vat=False, admin_user=None, payment_slip_path=None):
        """
        Confirm payout for a completed job with ACID transaction.
        
        This is the Single Source of Truth for releasing payments.
        All steps must succeed or none will be committed.
        
        Args:
            job_application: CampaignApplication instance
            proof_reference_id: Bank slip ID (MANDATORY)
            include_vat: Whether to calculate VAT on platform fee
            admin_user: The admin performing the action
            payment_slip_path: Optional path to saved slip image
            
        Returns:
            dict with success status and transaction details
            
        Raises:
            ValueError: If validation fails
            Exception: If any step fails (triggers rollback)
        """
        
        # ========================================
        # STEP 0: Input Validation
        # ========================================
        if not proof_reference_id or not proof_reference_id.strip():
            raise ValueError("หมายเลขอ้างอิง (Bank Slip ID) จำเป็นต้องระบุ")
        
        if not job_application:
            raise ValueError("ไม่พบข้อมูลงาน")
        
        # Check job status
        valid_statuses = ['COMPLETED', 'READY_TO_PAY']
        if job_application.status not in valid_statuses:
            raise ValueError(f"สถานะงานไม่ถูกต้อง: {job_application.status}")
        
        # Get job value (from campaign budget)
        gross_amount = job_application.campaign.budget
        if not gross_amount or gross_amount <= 0:
            raise ValueError("มูลค่างานไม่ถูกต้อง")
        
        # ========================================
        # STEP 1: Calculate Breakdown
        # ========================================
        breakdown = PlatformRevenue.calculate_breakdown(
            gross_amount, 
            include_vat=include_vat
        )
        
        platform_fee = breakdown['platform_fee']
        net_payout = breakdown['net_payout']
        vat_amount = breakdown['vat_amount']
        
        user = job_application.user
        
        # ========================================
        # STEP A: Create PAYOUT Transaction
        # ========================================
        payout_tx = Transaction.objects.create(
            job=job_application,
            sender=None,  # Platform is sender
            receiver=user,
            amount=net_payout,
            transaction_type='PAYOUT',
            status='COMPLETED',
            reference_note=proof_reference_id.strip(),
            description=f"การจ่ายเงินสำหรับแคมเปญ: {job_application.campaign.title}"
        )
        
        # ========================================
        # STEP B: Create SERVICE_FEE Transaction (Internal Tracking)
        # ========================================
        fee_tx = Transaction.objects.create(
            job=job_application,
            sender=user,
            receiver=None,  # Platform receives
            amount=platform_fee,
            transaction_type='SERVICE_FEE',
            status='COMPLETED',
            reference_note=proof_reference_id.strip(),
            description=f"Platform Fee (Internal) จากแคมเปญ: {job_application.campaign.title}"
        )
        
        # ========================================
        # STEP C: Create Platform Revenue Record
        # ========================================
        revenue = PlatformRevenue.objects.create(
            transaction=fee_tx,
            job=job_application,
            gross_amount=breakdown['gross_amount'],
            platform_fee=platform_fee,
            net_payout=net_payout,
            vat_amount=vat_amount,
            withholding_tax=Decimal('0.00')
        )
        
        # ========================================
        # STEP D: Update Job Status
        # ========================================
        job_application.status = 'PAYMENT_TRANSFERRED'
        if payment_slip_path:
            job_application.payment_slip.name = payment_slip_path
            job_application.save(update_fields=['status', 'updated_at', 'payment_slip'])
        else:
            job_application.save(update_fields=['status', 'updated_at'])
        
        # ========================================
        # STEP E: Update User Wallet (Optional)
        # ========================================
        try:
            wallet, created = Wallet.objects.get_or_create(
                user=user,
                defaults={'balance': Decimal('0.00'), 'status': 'ACTIVE'}
            )
            # For tracking purposes - actual money already transferred externally
            # wallet.balance += net_payout
            # wallet.save()
        except Exception:
            pass  # Wallet update is optional
        
        # ========================================
        # Send LINE Notification
        # ========================================
        try:
            from apps.users.services import LineMessagingService
            LineMessagingService.send_campaign_status_notification(
                job_application, 'COMPLETED', 'PAYMENT_TRANSFERRED'
            )
        except Exception as e:
            # Don't fail the transaction for notification errors
            print(f"Warning: Failed to send LINE notification: {e}")
        
        return {
            'success': True,
            'payout_transaction_id': str(payout_tx.id),
            'fee_transaction_id': str(fee_tx.id),
            'revenue_id': revenue.id,
            'breakdown': {
                'gross_amount': str(gross_amount),
                'platform_fee': str(platform_fee),
                'net_payout': str(net_payout),
                'vat_amount': str(vat_amount),
            }
        }
    
    @classmethod
    def get_pending_payouts(cls):
        """Get all jobs that are ready for payout."""
        from apps.campaigns.models import CampaignApplication
        
        return CampaignApplication.objects.filter(
            status__in=['COMPLETED', 'READY_TO_PAY']
        ).select_related('campaign', 'user').order_by('-updated_at')
    
    @classmethod
    def get_dashboard_stats(cls):
        """Get financial dashboard statistics."""
        from django.db.models import Sum, Count
        from apps.campaigns.models import CampaignApplication
        
        # Single Source of Truth for Realized Figures
        # We calculate GMV and Revenue from the same table to ensure they relate correctly.
        revenue_summary = PlatformRevenue.objects.aggregate(
            gmv=Sum('gross_amount'),
            revenue=Sum('platform_fee'),
            payouts=Sum('net_payout'),
            count=Count('id')
        )
        
        # Pending Payouts (Work completed but money not yet transferred)
        pending_jobs = CampaignApplication.objects.filter(
            status__in=['COMPLETED', 'READY_TO_PAY']
        )
        pending_count = pending_jobs.count()
        pending_amount = pending_jobs.aggregate(
            total=Sum('campaign__budget')
        )['total'] or Decimal('0.00')
        
        return {
            'total_gmv': revenue_summary['gmv'] or Decimal('0.00'),
            'total_revenue': revenue_summary['revenue'] or Decimal('0.00'),
            'pending_payout_count': pending_count,
            'pending_payout_amount': pending_amount,
            'total_payouts_made': revenue_summary['payouts'] or Decimal('0.00'),
            'total_payout_count': revenue_summary['count'] or 0,
        }
