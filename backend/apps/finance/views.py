"""
Financial API Views - Super Admin Only.

Provides REST API endpoints for:
- Payout confirmation
- Dashboard statistics
- Tax report export
"""

from decimal import Decimal
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.http import HttpResponse
from django.utils import timezone
import csv

from .services import PayoutService
from .models import Transaction, PlatformRevenue, Settlement


class IsSuperAdmin(IsAdminUser):
    """Permission class to check if user is a super admin."""
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class PayoutConfirmView(APIView):
    """
    POST /api/v1/admin/payout/confirm
    
    Confirm payment transfer with ACID transaction.
    Requires Super Admin authentication.
    """
    permission_classes = [IsSuperAdmin]
    
    def post(self, request):
        """
        Confirm a payout with bank slip image upload.
        
        Required fields:
        - job_id: CampaignApplication ID
        - slip_image: File upload (Mandatory)
        """
        from django.core.files.storage import default_storage
        from django.utils import timezone
        from apps.campaigns.models import CampaignApplication
        
        job_id = request.data.get('job_id')
        slip_file = request.FILES.get('slip_image')
        include_vat = request.data.get('include_vat', False) == 'true' # Handle string from FormData
        
        # Validation
        if not job_id:
            return Response(
                {'error': 'job_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not slip_file:
            return Response(
                {'error': 'Slip image is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get job application
        try:
            job = CampaignApplication.objects.select_related(
                'campaign', 'user'
            ).get(pk=job_id)
        except CampaignApplication.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Process payout
        try:
            # 1. Save Slip Image
            timestamp = int(timezone.now().timestamp())
            file_extension = slip_file.name.split('.')[-1]
            file_path = f'payout_slips/job_{job_id}_{timestamp}.{file_extension}'
            
            saved_path = default_storage.save(file_path, slip_file)
            slip_url = request.build_absolute_uri(default_storage.url(saved_path))
            
            # 2. Confirm Payout Service
            # We use the Slip URL as the reference ID for tracking
            proof_ref = f"SLIP: {slip_url}"
            
            result = PayoutService.confirm_payout(
                job_application=job,
                proof_reference_id=proof_ref,
                include_vat=include_vat,
                admin_user=request.user,
                payment_slip_path=saved_path
            )
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Payout failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BulkPayoutConfirmView(APIView):
    """
    POST /api/v1/admin/finance/payout/bulk-confirm/
    
    Handle bulk upload of slips and payout confirmation.
    Expects multipart/form-data.
    """
    permission_classes = [IsSuperAdmin]
    
    def post(self, request):
        import json
        from apps.campaigns.models import CampaignApplication
        from django.core.files.storage import default_storage

        transaction_ids_str = request.data.get('transaction_ids', '[]')
        try:
            job_ids = json.loads(transaction_ids_str)
        except json.JSONDecodeError:
            return Response({'error': 'Invalid transaction_ids format'}, status=400)

        if not job_ids:
            return Response({'error': 'No transactions selected'}, status=400)

        processed_count = 0
        errors = []

        for job_id in job_ids:
            file_key = f'proof_files_{job_id}'
            slip_file = request.FILES.get(file_key)
            
            if not slip_file:
                errors.append({'id': job_id, 'error': 'Missing file'})
                continue

            try:
                job = CampaignApplication.objects.select_related('campaign', 'user').get(pk=job_id)
                
                # Save file manually to get a persistent URL/Path (Simulated here or real upload)
                # In real production, PayoutService might expect a string ID.
                # However, the user requirement is "store the image URL".
                # PayoutService.confirm_payout expects 'proof_reference_id'. 
                # We reuse this field to store the Image URL in 'reference_note' for now,
                # or we upload it.
                
                # UPLOAD LOGIC: Save to media
                file_path = f'payout_slips/{job_id}_{int(timezone.now().timestamp())}.jpg'
                saved_path = default_storage.save(file_path, slip_file)
                slip_url = request.build_absolute_uri(default_storage.url(saved_path))
                
                # Call Service
                # We pass the URL as the proof_reference_id so it gets saved in transaction note
                PayoutService.confirm_payout(
                    job_application=job,
                    proof_reference_id=f"SLIP: {slip_url}", 
                    admin_user=request.user,
                    payment_slip_path=saved_path
                )
                processed_count += 1
                
            except Exception as e:
                print(f"Bulk Confirm Error {job_id}: {e}")
                errors.append({'id': job_id, 'error': str(e)})

        return Response({
            'success': True,
            'processed_count': processed_count,
            'errors': errors
        })


class FinanceDashboardView(APIView):
    """
    GET /api/v1/admin/finance/dashboard
    
    Get financial dashboard statistics.
    """
    permission_classes = [IsSuperAdmin]
    
    def get(self, request):
        """Return dashboard statistics."""
        try:
            stats = PayoutService.get_dashboard_stats()
            
            # Convert Decimal to string for JSON serialization
            return Response({
                'total_gmv': str(stats['total_gmv']),
                'total_revenue': str(stats['total_revenue']),
                'pending_payout_count': stats['pending_payout_count'],
                'pending_payout_amount': str(stats['pending_payout_amount']),
                'total_payouts_made': str(stats['total_payouts_made']),
                'total_payout_count': stats['total_payout_count'],
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PendingPayoutsView(APIView):
    """
    GET /api/v1/admin/finance/pending-payouts
    
    Get list of jobs ready for payout.
    """
    permission_classes = [IsSuperAdmin]
    
    def get(self, request):
        """Return list of pending payouts."""
        try:
            jobs = PayoutService.get_pending_payouts()
            
            data = []
            for job in jobs:
                breakdown = PlatformRevenue.calculate_breakdown(job.campaign.budget)
                data.append({
                    'id': job.id,
                    'campaign_title': job.campaign.title,
                    'brand_name': job.campaign.brand_name,
                    'influencer_name': job.user.display_name or job.user.username,
                    'influencer_line_id': job.user.line_user_id,
                    'status': job.status,
                    'completed_at': job.updated_at.isoformat() if job.updated_at else None,
                    'gross_amount': str(breakdown['gross_amount']),
                    'platform_fee': str(breakdown['platform_fee']),
                    'net_payout': str(breakdown['net_payout']),
                })
            
            return Response({
                'count': len(data),
                'results': data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TaxReportExportView(APIView):
    """
    GET /api/v1/admin/finance/export/tax-report
    
    Export tax report as CSV.
    """
    permission_classes = [IsSuperAdmin]
    
    def get(self, request):
        """Export tax report for revenue department."""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = PlatformRevenue.objects.select_related(
            'job__campaign', 'job__user', 'transaction'
        ).order_by('-created_at')
        
        # Apply date filters if provided
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        # Generate CSV
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="tax_report_{timezone.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        
        # Header row (Thai for Sompakorn compliance)
        writer.writerow([
            'วันที่',
            'เลขที่ธุรกรรม',
            'ชื่อบริษัท/แบรนด์',
            'ชื่อผู้รับเงิน (Influencer)',
            'เลขประจำตัวผู้เสียภาษี',
            'มูลค่ารวม (บาท)',
            'ค่าบริการ 10% (บาท)',
            'ภาษีมูลค่าเพิ่ม 7% (บาท)',
            'ภาษีหัก ณ ที่จ่าย (บาท)',
            'ยอดจ่ายสุทธิ (บาท)',
            'สถานะ'
        ])
        
        for rev in queryset:
            writer.writerow([
                rev.created_at.strftime('%d/%m/%Y'),
                str(rev.transaction_id)[:12] if rev.transaction else '-',
                rev.job.campaign.brand_name,
                rev.job.user.display_name or rev.job.user.username,
                '-',  # Tax ID - would need to be stored in user profile
                f'{rev.gross_amount:.2f}',
                f'{rev.platform_fee:.2f}',
                f'{rev.vat_amount:.2f}',
                f'{rev.withholding_tax:.2f}',
                f'{rev.net_payout:.2f}',
                'ชำระแล้ว'
            ])
        
        return response


class TransactionListView(APIView):
    """
    GET /api/v1/admin/finance/transactions
    
    Get list of all transactions.
    """
    permission_classes = [IsSuperAdmin]
    
    def get(self, request):
        """Return list of transactions with optional filters."""
        transaction_type = request.query_params.get('type')
        status_filter = request.query_params.get('status')
        limit = int(request.query_params.get('limit', 50))
        
        queryset = Transaction.objects.select_related(
            'sender', 'receiver', 'job__campaign'
        ).order_by('-created_at')
        
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        queryset = queryset[:limit]
        
        data = []
        for tx in queryset:
            data.append({
                'id': str(tx.id),
                'type': tx.transaction_type,
                'type_display': tx.get_transaction_type_display(),
                'amount': str(tx.amount),
                'status': tx.status,
                'status_display': tx.get_status_display(),
                'sender': tx.sender.display_name if tx.sender else None,
                'receiver': tx.receiver.display_name if tx.receiver else None,
                'campaign': tx.job.campaign.title if tx.job else None,
                'reference': tx.reference_note,
                'created_at': tx.created_at.isoformat(),
            })
        
        return Response({
            'count': len(data),
            'results': data
        })


class InternalRevenueView(APIView):
    """
    GET /api/v1/admin/finance/internal-revenue/
    POST /api/v1/admin/finance/internal-revenue/settle/
    
    Manage internal agency revenue settlement.
    """
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        """Get available revenue and settlement history."""
        # 1. Calculate Available Revenue (Unclaimed)
        unclaimed_revenues = PlatformRevenue.objects.filter(
            settlement_status='UNCLAIMED'
        )
        
        total_available = sum(r.platform_fee for r in unclaimed_revenues)
        
        # 2. Get Settlement History
        settlements = Settlement.objects.select_related('created_by').all().order_by('-created_at')[:20]
        
        history_data = []
        for s in settlements:
            history_data.append({
                'id': str(s.id),
                'date': s.created_at.isoformat(),
                'amount': str(s.total_amount),
                'note': s.note,
                'status': 'SETTLED',
                'created_by': s.created_by.get_full_name() or s.created_by.username if s.created_by else 'System'
            })
            
        return Response({
            'available_revenue': str(total_available),
            'history': history_data
        })

    def post(self, request):
        """
        Settle all currently UNCLAIMED revenue.
        """
        from django.db import transaction
        
        try:
            with transaction.atomic():
                # Lock rows for update
                unclaimed = PlatformRevenue.objects.filter(
                    settlement_status='UNCLAIMED'
                ).select_for_update()
                
                if not unclaimed.exists():
                     return Response({'error': 'No revenue to settle'}, status=status.HTTP_400_BAD_REQUEST)
                     
                total_amount = sum(r.platform_fee for r in unclaimed)
                
                # Create Settlement Record
                settlement = Settlement.objects.create(
                    total_amount=total_amount,
                    created_by=request.user,
                    note=request.data.get('note', '')
                )
                
                # Update Revenues to link to this settlement
                count = unclaimed.update(
                    settlement=settlement,
                    settlement_status='SETTLED'
                )
                
                return Response({
                    'success': True,
                    'settlement_id': str(settlement.id),
                    'amount': str(total_amount),
                    'count': count
                })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
