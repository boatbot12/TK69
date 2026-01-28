"""
Financial & Accounting Module Models.

Provides:
- Wallet: User wallet with balance tracking
- Transaction: Immutable ledger for all financial transactions
- PlatformRevenue: Agency fee records for internal accounting (not deducted from influencer)
"""

import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError


class Wallet(models.Model):
    """
    User wallet for tracking balance.
    Each user has one wallet that tracks their earnings.
    """
    
    STATUS_CHOICES = [
        ('ACTIVE', 'ใช้งานปกติ'),
        ('FROZEN', 'ถูกระงับ'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet',
        verbose_name='ผู้ใช้'
    )
    balance = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        verbose_name='ยอดเงินคงเหลือ',
        help_text='ยอดเงินปัจจุบันในกระเป๋า (ห้ามติดลบ)'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        verbose_name='สถานะ'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='สร้างเมื่อ')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='อัปเดตเมื่อ')
    
    class Meta:
        verbose_name = 'กระเป๋าเงิน'
        verbose_name_plural = 'กระเป๋าเงินทั้งหมด'
        # constraints = [
        #     models.CheckConstraint(
        #         check=models.Q(balance__gte=Decimal('0.00')),
        #         name='wallet_balance_non_negative'
        #     )
        # ]
    
    def __str__(self):
        return f"{self.user.display_name or self.user.username} - ฿{self.balance:,.2f}"
    
    def clean(self):
        if self.balance < Decimal('0.00'):
            raise ValidationError({'balance': 'ยอดเงินคงเหลือห้ามติดลบ'})


class Transaction(models.Model):
    """
    Immutable transaction ledger.
    Records all financial movements - NO DELETE allowed.
    """
    
    TYPE_CHOICES = [
        ('DEPOSIT', 'ฝากเงิน'),
        ('PAYOUT', 'จ่ายเงิน Influencer'),
        ('SERVICE_FEE', 'ค่าคอมมิชชั่น Platform'),
        ('VAT', 'ภาษีมูลค่าเพิ่ม'),
        ('WITHDRAWAL', 'ถอนเงิน'),
        ('REFUND', 'คืนเงิน'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'รอดำเนินการ'),
        ('COMPLETED', 'สำเร็จ'),
        ('FAILED', 'ล้มเหลว'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name='รหัสธุรกรรม'
    )
    job = models.ForeignKey(
        'campaigns.CampaignApplication',
        on_delete=models.PROTECT,  # Prevent deletion if has transactions
        related_name='transactions',
        null=True,
        blank=True,
        verbose_name='งาน'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='sent_transactions',
        null=True,
        blank=True,
        verbose_name='ผู้จ่าย'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='received_transactions',
        null=True,
        blank=True,
        verbose_name='ผู้รับ'
    )
    amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='จำนวนเงิน'
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        db_index=True,
        verbose_name='ประเภท'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        db_index=True,
        verbose_name='สถานะ'
    )
    reference_note = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='หมายเลขอ้างอิง',
        help_text='เลขที่สลิป หรือ Reference ID จากธนาคาร'
    )
    description = models.TextField(
        blank=True,
        verbose_name='รายละเอียด'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name='วันที่ทำรายการ'
    )
    
    class Meta:
        verbose_name = 'ธุรกรรม'
        verbose_name_plural = 'รายการธุรกรรม'
        ordering = ['-created_at']
        # Prevent deletion at database level
        managed = True
    
    def __str__(self):
        return f"{self.get_transaction_type_display()} - ฿{self.amount:,.2f} ({self.status})"
    
    def delete(self, *args, **kwargs):
        """Prevent deletion of transactions - immutable ledger."""
        raise ValidationError("ไม่สามารถลบรายการธุรกรรมได้ (Immutable Ledger)")
    
    def save(self, *args, **kwargs):
        # Prevent modification of completed transactions
        if self.pk:
            old_instance = Transaction.objects.filter(pk=self.pk).first()
            if old_instance and old_instance.status == 'COMPLETED':
                # Only allow status update for error handling
                if hasattr(self, '_force_update'):
                    pass
                else:
                    raise ValidationError("ไม่สามารถแก้ไขธุรกรรมที่สำเร็จแล้ว")
        super().save(*args, **kwargs)


class Settlement(models.Model):
    """
    Record of internal revenue settlements.
    Groups multiple PlatformRevenue records that were settled together.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name='รหัสการชำระเงิน'
    )
    total_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        verbose_name='ยอดรวมที่ชำระ',
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    note = models.TextField(
        blank=True,
        verbose_name='หมายเหตุ'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='สร้างเมื่อ'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_settlements',
        verbose_name='ผู้ทำรายการ'
    )

    class Meta:
        verbose_name = 'การชำระบัญชีรายได้'
        verbose_name_plural = 'รายการชำระบัญชีรายได้'
        ordering = ['-created_at']

    def __str__(self):
        return f"Settlement {self.created_at.strftime('%Y-%m-%d')} - ฿{self.total_amount:,.2f}"

class PlatformRevenue(models.Model):
    """
    Platform revenue record for each completed job.
    Tracks the agency fee for internal accounting purposes.
    NOTE: This fee is NOT deducted from influencer payments - paid separately by agency.
    """
    
    SETTLEMENT_STATUS_CHOICES = [
        ('UNCLAIMED', 'รอการชำระ'),
        ('PENDING', 'กำลังดำเนินการ'),
        ('SETTLED', 'ชำระแล้ว'),
    ]
    
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.PROTECT,
        related_name='revenue_record',
        verbose_name='ธุรกรรมอ้างอิง'
    )
    job = models.ForeignKey(
        'campaigns.CampaignApplication',
        on_delete=models.PROTECT,
        related_name='revenue_records',
        verbose_name='งาน'
    )
    gross_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        verbose_name='มูลค่างานรวม',
        help_text='ราคางานเต็มก่อนหักค่าบริการ'
    )
    platform_fee = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        verbose_name='Agency Fee (Internal)',
        help_text='Agency fee for internal tracking - NOT deducted from influencer'
    )
    net_payout = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        verbose_name='ยอดจ่าย Influencer',
        help_text='Full payment to influencer (no deduction)'
    )
    vat_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='ภาษีมูลค่าเพิ่ม (VAT)',
        help_text='7% ของค่าบริการ (ถ้ามี)'
    )
    withholding_tax = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='ภาษีหัก ณ ที่จ่าย',
        help_text='ภาษีหัก ณ ที่จ่าย 3% (ถ้ามี)'
    )
    settlement_status = models.CharField(
        max_length=20,
        choices=SETTLEMENT_STATUS_CHOICES,
        default='UNCLAIMED',
        db_index=True,
        verbose_name='สถานะการชำระบัญชี'
    )
    settlement = models.ForeignKey(
        Settlement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='revenues',
        verbose_name='รายการชำระบัญชี'
    )


    created_at = models.DateTimeField(auto_now_add=True, verbose_name='บันทึกเมื่อ')
    
    class Meta:
        verbose_name = 'รายได้ Platform'
        verbose_name_plural = 'รายได้ Platform ทั้งหมด'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Revenue: ฿{self.platform_fee:,.2f} from {self.job}"
    
    @classmethod
    def calculate_breakdown(cls, gross_amount, include_vat=False, include_wht=False):
        """
        Calculate payment breakdown.
        
        NOTE: Influencers receive the FULL gross_amount.
        The platform_fee is tracked for agency accounting only (paid separately).
        
        Args:
            gross_amount: Total job value
            include_vat: Whether to calculate VAT on platform fee
            include_wht: Whether to calculate withholding tax
            
        Returns:
            dict with platform_fee, net_payout, vat_amount, wht_amount
        """
        # Input is effectively the Net Payout (Budget set in system)
        # We need to calculate Gross (Total Value) such that Fee is 10% of Gross.
        # Gross = Net + Fee
        # Fee = 0.10 * Gross
        # Net = 0.90 * Gross
        # So: Gross = Net / 0.90
        
        net_payout = Decimal(str(gross_amount))
        
        # Calculate Real Gross
        real_gross = (net_payout / Decimal('0.90')).quantize(Decimal('0.01'))
        
        # Platform Fee is difference (or 10% of Real Gross)
        platform_fee = real_gross - net_payout
        
        vat_amount = Decimal('0.00')
        wht_amount = Decimal('0.00')
        
        if include_vat:
            vat_amount = (platform_fee * Decimal('0.07')).quantize(Decimal('0.01'))
        
        if include_wht:
            wht_amount = (net_payout * Decimal('0.03')).quantize(Decimal('0.01'))
        
        return {
            'gross_amount': real_gross,
            'platform_fee': platform_fee,
            'net_payout': net_payout,
            'vat_amount': vat_amount,
            'withholding_tax': wht_amount,
        }
