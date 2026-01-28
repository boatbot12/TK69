"""
Custom User model for LINE LIFF authentication.
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Custom user manager for LINE-based authentication."""
    
    def create_user(self, line_user_id, display_name='', **extra_fields):
        """Create and save a regular user with LINE user ID."""
        if not line_user_id:
            raise ValueError('The LINE user ID must be set')
        
        user = self.model(
            line_user_id=line_user_id,
            display_name=display_name,
            username=line_user_id,  # Use LINE ID as username
            **extra_fields
        )
        user.set_unusable_password()  # No password for LINE auth
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        """Create and save a superuser (for admin access)."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('status', 'APPROVED')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        user = self.model(
            username=username,
            email=email,
            line_user_id=f'admin_{username}',
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractUser):
    """
    Custom User model with LINE LIFF integration.
    
    Status Flow:
    - NEW: Just created via LINE login, needs to complete registration
    - PENDING: Registration submitted, awaiting admin approval
    - APPROVED: Admin approved, full access granted
    - REJECTED: Admin rejected, access denied
    """
    
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    line_user_id = models.CharField(
        max_length=50, 
        unique=True, 
        db_index=True,
        help_text="Unique identifier from LINE",
        verbose_name="LINE User ID"
    )
    display_name = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Display name from LINE profile",
        verbose_name="ชื่อที่แสดง"
    )
    picture_url = models.URLField(
        max_length=1000,
        blank=True,
        help_text="Profile picture URL from LINE",
        verbose_name="รูปโปรไฟล์"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='NEW',
        db_index=True,
        help_text="User approval status",
        verbose_name="สถานะ"
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text="Reason for rejection (if rejected)",
        verbose_name="เหตุผลที่ปฏิเสธ"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="วันที่สมัคร")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="อัปเดตล่าสุด")
    
    objects = UserManager()
    
    class Meta:
        verbose_name = 'ผู้ใช้งาน'
        verbose_name_plural = 'ผู้ใช้งานทั้งหมด'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.display_name or self.username} ({self.line_user_id})"
    
    @property
    def is_approved(self):
        """Check if user is approved to access platform features."""
        return self.status == 'APPROVED'
    
    @property
    def is_pending(self):
        """Check if user is pending approval."""
        return self.status == 'PENDING'
    
    @property
    def needs_registration(self):
        """Check if user needs to complete registration."""
        return self.status == 'NEW'
    
    def approve(self):
        """Approve the user."""
        self.status = 'APPROVED'
        self.rejection_reason = ''
        self.save(update_fields=['status', 'rejection_reason', 'updated_at'])
    
    def reject(self, reason=''):
        """Reject the user with optional reason."""
        self.status = 'REJECTED'
        self.rejection_reason = reason
        self.save(update_fields=['status', 'rejection_reason', 'updated_at'])
    
    def submit_registration(self):
        """Mark user as pending after registration submission."""
        if self.status == 'NEW':
            self.status = 'PENDING'
            self.save(update_fields=['status', 'updated_at'])
