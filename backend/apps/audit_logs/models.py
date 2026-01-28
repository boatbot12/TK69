from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class AdminLog(models.Model):
    """
    Log of admin actions for auditing purposes.
    """
    ACTION_TYPES = (
        ('approve_user', 'Approve User User'),
        ('reject_user', 'Reject User'),
        ('create_campaign', 'Create Campaign'),
        ('edit_campaign', 'Edit Campaign'),
        ('approve_work', 'Approve Work'),
        ('reject_work', 'Reject Work'),
        ('comment_user', 'Comment on User'),
        ('other', 'Other'),
    )

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='admin_logs',
        verbose_name=_('Performed by')
    )
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    
    # Target Object Reference
    target_model = models.CharField(max_length=100, help_text="Model name e.g. User, Campaign")
    target_id = models.IntegerField(null=True, blank=True)
    target_str = models.CharField(max_length=255, help_text="String representation of the target")
    
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Admin Activity Log')
        verbose_name_plural = _('Admin Activity Logs')

    def __str__(self):
        return f"{self.actor} {self.action_type} {self.target_str}"
