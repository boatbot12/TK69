from django.db import models
from django.conf import settings

class SupportTicket(models.Model):
    """
    Model for storing user support tickets.
    Syncs with GitHub Issues.
    """
    
    TOPIC_CHOICES = [
        ('BUG', 'Bug Report'),
        ('PAYMENT', 'Payment Issue'),
        ('ACCOUNT', 'Account Settings'),
        ('OTHER', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='support_tickets',
        verbose_name="ผู้ร้องเรียน"
    )
    topic = models.CharField(max_length=20, choices=TOPIC_CHOICES, verbose_name="หัวข้อ")
    subject = models.CharField(max_length=200, verbose_name="เรื่อง")
    description = models.TextField(verbose_name="รายละเอียด")
    attachments = models.JSONField(default=list, blank=True, verbose_name="ไฟล์แนบ")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN', verbose_name="สถานะ")
    github_issue_url = models.URLField(blank=True, null=True, help_text="Link to the GitHub Issue", verbose_name="ลิงก์ GitHub Issue")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="สร้างเมื่อ")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="แก้ไขเมื่อ")

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'ตั๋วแจ้งปัญหา'
        verbose_name_plural = 'รายการแจ้งปัญหา'

    def __str__(self):
        return f"[{self.get_topic_display()}] {self.subject} ({self.user.display_name})"
