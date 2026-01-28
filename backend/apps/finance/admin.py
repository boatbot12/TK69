"""
Financial Admin - Super Admin Only.

Provides read-only views and controlled actions for financial management.
"""

from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.utils.html import format_html
from django.urls import reverse
from django.http import HttpResponse
from django.utils import timezone
import csv
from decimal import Decimal

from .models import Wallet, Transaction, PlatformRevenue, Settlement


class TransactionTypeFilter(SimpleListFilter):
    title = 'ประเภทธุรกรรม'
    parameter_name = 'transaction_type'
    
    def lookups(self, request, model_admin):
        return Transaction.TYPE_CHOICES
    
    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(transaction_type=self.value())
        return queryset


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    """Admin for viewing and managing user wallets."""
    
    list_display = [
        'user_display', 'balance_display', 'status_badge', 
        'created_at', 'updated_at'
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['user__display_name', 'user__username', 'user__line_user_id']
    readonly_fields = ['user', 'created_at', 'updated_at']
    ordering = ['-balance']
    
    actions = ['freeze_wallets', 'unfreeze_wallets']
    
    fieldsets = (
        ('ข้อมูลกระเป๋า', {
            'fields': ('user', 'balance', 'status')
        }),
        ('เวลา', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_display(self, obj):
        return obj.user.display_name or obj.user.username
    user_display.short_description = 'ผู้ใช้'
    user_display.admin_order_field = 'user__display_name'
    
    def balance_display(self, obj):
        balance_str = "{:,.2f}".format(obj.balance)
        return format_html(
            '<span style="font-family: monospace; font-size: 14px; font-weight: bold;">฿{}</span>',
            balance_str
        )
    balance_display.short_description = 'ยอดเงิน'
    balance_display.admin_order_field = 'balance'
    
    def status_badge(self, obj):
        if obj.status == 'ACTIVE':
            return format_html(
                '<span style="padding: 4px 12px; background: #d4edda; color: #155724; border-radius: 12px; font-size: 12px;">✓ ปกติ</span>'
            )
        return format_html(
            '<span style="padding: 4px 12px; background: #f8d7da; color: #721c24; border-radius: 12px; font-size: 12px;">🔒 ระงับ</span>'
        )
    status_badge.short_description = 'สถานะ'
    
    @admin.action(description='🔒 ระงับกระเป๋าที่เลือก')
    def freeze_wallets(self, request, queryset):
        count = queryset.update(status='FROZEN')
        self.message_user(request, f'ระงับ {count} กระเป๋าเรียบร้อย')
    
    @admin.action(description='✓ ปลดล็อคกระเป๋าที่เลือก')
    def unfreeze_wallets(self, request, queryset):
        count = queryset.update(status='ACTIVE')
        self.message_user(request, f'ปลดล็อค {count} กระเป๋าเรียบร้อย')
    
    def has_add_permission(self, request):
        return True
    
    def has_delete_permission(self, request, obj=None):
        return True  # Allow delete if absolutely necessary for admins


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Read-only admin for transaction ledger."""
    
    list_display = [
        'id_short', 'type_badge', 'amount_display', 
        'status_badge', 'receiver_display', 'reference_note', 'created_at'
    ]
    list_filter = [TransactionTypeFilter, 'status', 'created_at']
    search_fields = [
        'id', 'reference_note', 
        'receiver__display_name', 'sender__display_name',
        'job__campaign__title'
    ]
    readonly_fields = [
        'created_at'
    ]
    ordering = ['-created_at']
    
    actions = ['export_to_csv']
    
    fieldsets = (
        ('ข้อมูลธุรกรรม', {
            'fields': ('id', 'transaction_type', 'amount', 'status')
        }),
        ('ผู้เกี่ยวข้อง', {
            'fields': ('sender', 'receiver', 'job')
        }),
        ('รายละเอียด', {
            'fields': ('reference_note', 'description')
        }),
        ('เวลา', {
            'fields': ('created_at',)
        }),
    )
    
    def id_short(self, obj):
        return format_html(
            '<code style="font-size: 11px; color: #475569; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">{}</code>',
            str(obj.id)[:8]
        )
    id_short.short_description = 'ID'
    
    def type_badge(self, obj):
        colors = {
            'DEPOSIT': '#17a2b8',
            'PAYOUT': '#28a745',
            'SERVICE_FEE': '#fd7e14',
            'VAT': '#6c757d',
            'WITHDRAWAL': '#dc3545',
            'REFUND': '#6f42c1',
        }
        color = colors.get(obj.transaction_type, '#6c757d')
        return format_html(
            '<span style="padding: 4px 8px; background: {}; color: white; border-radius: 8px; font-size: 11px;">{}</span>',
            color, obj.get_transaction_type_display()
        )
    type_badge.short_description = 'ประเภท'
    
    def amount_display(self, obj):
        amount_str = "{:,.2f}".format(obj.amount)
        color = '#10b981' if obj.transaction_type in ['DEPOSIT', 'PAYOUT'] else '#64748b'
        if obj.transaction_type == 'WITHDRAWAL':
            color = '#ef4444'
            
        return format_html(
            '<span style="font-family: monospace; font-size: 14px; font-weight: 600; color: {};">฿{}</span>',
            color, amount_str
        )
    amount_display.short_description = 'จำนวนเงิน'
    amount_display.admin_order_field = 'amount'
    
    def status_badge(self, obj):
        if obj.status == 'COMPLETED':
            return format_html(
                '<span style="padding: 4px 10px; background: #dcfce7; color: #15803d; border-radius: 9999px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center;">✓ สำเร็จ</span>'
            )
        elif obj.status == 'PENDING':
            return format_html(
                '<span style="padding: 4px 10px; background: #fef9c3; color: #a16207; border-radius: 9999px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center;">⏳ รอดำเนินการ</span>'
            )
        return format_html(
            '<span style="padding: 4px 10px; background: #fee2e2; color: #b91c1c; border-radius: 9999px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center;">✗ ล้มเหลว</span>'
        )
    status_badge.short_description = 'สถานะ'
    
    def receiver_display(self, obj):
        if obj.receiver:
            return obj.receiver.display_name or obj.receiver.username
        return '-'
    receiver_display.short_description = 'ผู้รับเงิน'
    
    @admin.action(description='📊 Export เป็น CSV')
    def export_to_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="transactions_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Transaction ID', 'Date', 'Type', 'Amount', 
            'Status', 'Sender', 'Receiver', 'Reference', 'Description'
        ])
        
        for tx in queryset:
            writer.writerow([
                str(tx.id),
                tx.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                tx.get_transaction_type_display(),
                f'{tx.amount:.2f}',
                tx.get_status_display(),
                tx.sender.display_name if tx.sender else '',
                tx.receiver.display_name if tx.receiver else '',
                tx.reference_note,
                tx.description,
            ])
        
        return response
    
    def has_add_permission(self, request):
        return True
    
    def has_change_permission(self, request, obj=None):
        return True
    
    def has_delete_permission(self, request, obj=None):
        return True


@admin.register(PlatformRevenue)
class PlatformRevenueAdmin(admin.ModelAdmin):
    """Admin for platform revenue records."""
    
    list_display = [
        'job_display', 'gross_display', 'fee_display', 
        'payout_display', 'vat_display', 'created_at'
    ]
    list_filter = ['created_at']
    search_fields = [
        'job__campaign__title', 'job__user__display_name',
        'transaction__id'
    ]
    readonly_fields = [
        'created_at'
    ]
    ordering = ['-created_at']
    
    actions = ['export_tax_report']
    
    fieldsets = (
        ('รายละเอียดงาน', {
            'fields': ('job', 'transaction')
        }),
        ('การคำนวณ', {
            'fields': ('gross_amount', 'platform_fee', 'net_payout')
        }),
        ('ภาษี', {
            'fields': ('vat_amount', 'withholding_tax')
        }),
        ('เวลา', {
            'fields': ('created_at',)
        }),
    )
    
    def job_display(self, obj):
        return f"{obj.job.campaign.title[:30]}... - {obj.job.user.display_name}"
    job_display.short_description = 'งาน'
    
    def gross_display(self, obj):
        amount_str = "{:,.2f}".format(float(obj.gross_amount))
        return format_html(
            '<span style="font-family: monospace;">฿{}</span>',
            amount_str
        )
    gross_display.short_description = 'มูลค่างาน'
    
    def fee_display(self, obj):
        amount_str = "{:,.2f}".format(float(obj.platform_fee))
        return format_html(
            '<span style="font-family: monospace; color: #fd7e14; font-weight: bold;">฿{}</span>',
            amount_str
        )
    fee_display.short_description = 'รายได้ (10%)'
    
    def payout_display(self, obj):
        amount_str = "{:,.2f}".format(float(obj.net_payout))
        return format_html(
            '<span style="font-family: monospace; color: #28a745;">฿{}</span>',
            amount_str
        )
    payout_display.short_description = 'จ่าย Influencer'
    
    def vat_display(self, obj):
        if obj.vat_amount > 0:
            amount_str = "{:,.2f}".format(float(obj.vat_amount))
            return format_html(
                '<span style="font-family: monospace;">฿{}</span>',
                amount_str
            )
        return '-'
    vat_display.short_description = 'VAT'
    
    @admin.action(description='📋 Export รายงานภาษี (สรรพากร)')
    def export_tax_report(self, request, queryset):
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="tax_report_{timezone.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'วันที่', 'เลขที่อ้างอิง', 'ชื่อบริษัท (Payer)', 
            'ชื่อ Influencer (Payee)', 'มูลค่ารวม', 'ค่าบริการ 10%',
            'VAT 7%', 'หัก ณ ที่จ่าย', 'ยอดจ่ายสุทธิ'
        ])
        
        for rev in queryset.select_related('job__campaign', 'job__user'):
            writer.writerow([
                rev.created_at.strftime('%Y-%m-%d'),
                str(rev.transaction_id)[:8] if rev.transaction else '',
                rev.job.campaign.brand_name,
                rev.job.user.display_name or rev.job.user.username,
                f'{rev.gross_amount:.2f}',
                f'{rev.platform_fee:.2f}',
                f'{rev.vat_amount:.2f}',
                f'{rev.withholding_tax:.2f}',
                f'{rev.net_payout:.2f}',
            ])
        
        self.message_user(request, f'Export {queryset.count()} รายการเรียบร้อย')
        return response
    
    def has_add_permission(self, request):
        return True
    
    def has_change_permission(self, request, obj=None):
        return True
    
    def has_delete_permission(self, request, obj=None):
        return True


@admin.register(Settlement)
class SettlementAdmin(admin.ModelAdmin):
    """Admin for revenue settlements."""
    list_display = ['id', 'total_amount', 'created_at', 'created_by']
    list_filter = ['created_at']
    search_fields = ['id', 'note']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
