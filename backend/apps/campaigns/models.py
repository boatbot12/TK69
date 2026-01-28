"""
Campaign and CampaignApplication models.
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import uuid


def brand_logo_upload_path(instance, filename):
    """Generate upload path for brand logos."""
    return f'campaigns/{instance.id}/logo/{filename}'


def campaign_cover_upload_path(instance, filename):
    """Generate upload path for campaign cover images."""
    return f'campaigns/{instance.id}/cover/{filename}'


def payment_slip_upload_path(instance, filename):
    """Generate upload path for payment slips."""
    return f'campaigns/{instance.campaign.id}/applications/{instance.id}/payment/{filename}'


def delete_old_file(instance, field_name):
    """Helper to delete old file from storage when it is replaced."""
    try:
        if not instance.pk:
            return

        old_instance = instance.__class__.objects.filter(pk=instance.pk).first()
        if not old_instance:
            return

        old_file = getattr(old_instance, field_name)
        new_file = getattr(instance, field_name)
        
        # Check if old_file exists and is different from new_file
        # We compare names to be safe with GCS/FileSystem variations
        if old_file and old_file.name and old_file.name != getattr(new_file, 'name', new_file):
            print(f"[Cleanup] Deleting old file: {old_file.name}")
            old_file.storage.delete(old_file.name)
    except Exception as e:
        print(f"Error deleting old file: {e}")


class Campaign(models.Model):
    """
    Marketing campaign that influencers can apply to.
    """
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('OPEN', 'Open for Applications'),
        ('IN_PROGRESS', 'In Progress'),
        ('CLOSED', 'Closed'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    
    title = models.CharField(
        max_length=200,
        help_text="Campaign title",
        verbose_name="ชื่อแคมเปญ"
    )
    description = models.TextField(
        help_text="Short description for card view",
        verbose_name="คำอธิบายอย่างย่อ"
    )
    full_description = models.TextField(
        blank=True,
        help_text="Full campaign brief and requirements",
        verbose_name="รายละเอียดทั้งหมด"
    )
    brand_name = models.CharField(
        max_length=100,
        help_text="Brand/Company name",
        verbose_name="ชื่อแบรนด์"
    )
    brand_logo = models.ImageField(
        upload_to=brand_logo_upload_path,
        blank=True,
        help_text="Brand logo image",
        verbose_name="โลโก้แบรนด์"
    )
    cover_image = models.ImageField(
        upload_to=campaign_cover_upload_path,
        blank=True,
        null=True,
        help_text="Campaign cover image (displayed on dashboard)",
        verbose_name="รูปปกแคมเปญ"
    )
    
    # Budget
    budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Budget per person in THB",
        verbose_name="งบประมาณ (บาท)"
    )

    # Requirements & Location
    location = models.CharField(
        max_length=100,
        blank=True,
        help_text="Campaign location (e.g. Bangkok, Online)",
        verbose_name="สถานที่"
    )
    followers_required = models.IntegerField(
        default=0,
        null=True,
        blank=True,
        help_text="Minimum followers required",
        verbose_name="ยอดผู้ติดตามขั้นต่ำ"
    )
    brief_url = models.URLField(
        max_length=2000,
        null=True,
        blank=True,
        help_text="Link to campaign brief/details (e.g. Google Doc, Canva)",
        verbose_name="ลิงก์รายละเอียดบรีฟงาน"
    )
    
    # Deadlines
    application_deadline = models.DateField(
        help_text="Last date to apply",
        verbose_name="ปิดรับสมัคร"
    )
    content_deadline = models.DateField(
        help_text="Content submission deadline",
        verbose_name="กำหนดส่งงาน"
    )
    
    # Workflow Deadlines
    script_deadline = models.DateField(
        null=True,
        blank=True,
        help_text="Deadline for script submission",
        verbose_name="กำหนดส่งสคริปต์"
    )
    draft_deadline = models.DateField(
        null=True,
        blank=True,
        help_text="Deadline for draft video submission",
        verbose_name="กำหนดส่งดราฟท์"
    )
    final_deadline = models.DateField(
        null=True,
        blank=True,
        help_text="Deadline for final work submission",
        verbose_name="กำหนดส่งไฟนอล"
    )
    insight_deadline = models.DateField(
        null=True,
        blank=True,
        help_text="Deadline for insight submission",
        verbose_name="กำหนดส่ง Insight"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='DRAFT',
        db_index=True,
        verbose_name="สถานะ"
    )
    
    # Requirements (Text)
    requirements = models.TextField(
        blank=True,
        help_text="Campaign requirements (min followers, platforms, etc.)",
        verbose_name="ข้อกำหนดเพิ่มเติม"
    )

    # Settings
    show_slip_to_client = models.BooleanField(
        default=False, 
        verbose_name="แสดงสลิปให้ลูกค้าเห็น"
    )

    # Share Link
    share_token = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        help_text="Token for client sharing",
        verbose_name="Share Token"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="สร้างเมื่อ")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="แก้ไขเมื่อ")

    def save(self, *args, **kwargs):
        # 1. Generate share token if missing
        if not self.share_token:
            import uuid as uuid_lib
            self.share_token = str(uuid_lib.uuid4())
            
        # 2. Cleanup old files on update (only if images are provided/changed)
        if self.pk:
            # We check if the field has been updated by comparing with DB
            # This is handled within delete_old_file
            delete_old_file(self, 'brand_logo')
            delete_old_file(self, 'cover_image')
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.brand_name})"
    

    
    @property
    def is_open(self):
        """Check if campaign is accepting applications."""
        return self.status == 'OPEN'

    def update_status_by_deadline(self):
        """
        Update status based on current date and deadlines.
        Logic:
        1. If status is OPEN and application_deadline has passed -> IN_PROGRESS
        2. If status is IN_PROGRESS and content_deadline has passed -> CLOSED
        """
        from django.utils import timezone
        today = timezone.localdate()
        
        changed = False
        
        # 🟢 OPEN -> IN_PROGRESS
        # If today is AFTER application_deadline, it's now IN_PROGRESS
        if self.status == 'OPEN' and self.application_deadline < today:
            self.status = 'IN_PROGRESS'
            changed = True
            
        # 🟡 IN_PROGRESS -> CLOSED
        # If today is AFTER content_deadline, it's CLOSED
        if self.status == 'IN_PROGRESS' and self.content_deadline < today:
            self.status = 'CLOSED'
            changed = True
            
        if changed:
            self.save(update_fields=['status', 'updated_at'])
        
        return changed

    @classmethod
    def update_all_statuses(cls):
        """Batch update all campaigns that need transition."""
        from django.utils import timezone
        today = timezone.localdate()
        
        # 1. OPEN -> IN_PROGRESS (passed application deadline)
        to_in_progress = cls.objects.filter(status='OPEN', application_deadline__lt=today)
        in_progress_count = to_in_progress.count()
        if in_progress_count > 0:
            print(f"[CampaignAutomation] Moving {in_progress_count} campaigns from OPEN to IN_PROGRESS")
            to_in_progress.update(status='IN_PROGRESS', updated_at=timezone.now())
        
        # 2. IN_PROGRESS -> CLOSED (passed content deadline)
        to_closed = cls.objects.filter(status='IN_PROGRESS', content_deadline__lt=today)
        closed_count = to_closed.count()
        if closed_count > 0:
            print(f"[CampaignAutomation] Moving {closed_count} campaigns from IN_PROGRESS to CLOSED")
            to_closed.update(status='CLOSED', updated_at=timezone.now())
        
        return in_progress_count + closed_count


class CampaignApplication(models.Model):
    """
    Application/participation record for a campaign.
    
    State Machine Statuses:
    - WAITING: Application submitted, awaiting admin approval
    - APPROVED: Application approved, can start working
    - WORK_IN_PROGRESS: Actively working on content
    - SUBMITTED_SCRIPT: Script submitted for review
    - SCRIPT_APPROVED: Script approved, can submit draft
    - SUBMITTED_DRAFT: Draft submitted for review
    - DRAFT_APPROVED: Draft approved, can submit final
    - SUBMITTED_FINAL: Final content submitted for review
    - COMPLETED: Campaign completed successfully
    - REJECTED: Application or submission rejected
    """
    
    STATUS_CHOICES = [
        ('WAITING', 'Waiting for Approval'),
        ('APPROVED', 'Application Approved'),
        ('WORK_IN_PROGRESS', 'Working on Content'),
        ('SUBMITTED_SCRIPT', 'Script Submitted'),
        ('SCRIPT_APPROVED', 'Script Approved'),
        ('REVISE_SCRIPT', 'Revise Script'),
        ('SUBMITTED_DRAFT', 'Draft Submitted'),
        ('DRAFT_APPROVED', 'Draft Approved'),
        ('REVISE_DRAFT', 'Revise Draft'),
        ('SUBMITTED_FINAL', 'Final Submitted'),
        ('FINAL_APPROVED', 'Final Approved (Wait for Insight)'),
        ('REVISE_FINAL', 'Revise Final'),
        ('SUBMITTED_INSIGHT', 'Insight Submitted'),
        ('REVISE_INSIGHT', 'Revise Insight'),
        ('INSIGHT_APPROVED', 'Insight Approved'),
        ('COMPLETED', 'Campaign Completed'),  # Work done, waiting for payment processes
        ('PAYMENT_TRANSFERRED', 'Payment Transferred'),  # Job fully closed
        ('REJECTED', 'Rejected'),
    ]
    
    # Timeline stages for UI
    TIMELINE_STAGES = [
        ('brief', 'Brief', '📋'),
        ('script', 'Script', '📝'),
        ('draft', 'Draft', '🎬'),
        ('final', 'Final', '✅'),
        ('insight', 'Insight', '📊'),
        ('payment', 'Payment', '💰'),
    ]
    
    campaign = models.ForeignKey(
        Campaign,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='WAITING',
        db_index=True
    )
    
    # Submission data (JSON structure for each stage)
    submission_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Submissions for each stage (script, draft, final)",
        verbose_name="ข้อมูลการส่งงาน"
    )
    
    # Payment slip image (uploaded by admin when payment is complete)
    payment_slip = models.ImageField(
        upload_to=payment_slip_upload_path,
        blank=True,
        null=True,
        help_text="Payment slip image uploaded by admin",
        verbose_name="สลิปการโอนเงิน"
    )
    
    # Admin notes
    admin_notes = models.TextField(
        blank=True,
        help_text="Internal notes from admin",
        verbose_name="โน้ตผู้ดูแล"
    )
    
    # Insight data (simplified structure - single field, overwrites on revision)
    insight_image = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL to insight screenshot",
        verbose_name="รูป Insight"
    )
    insight_files = models.JSONField(
        default=list,
        blank=True,
        help_text="List of insight screenshot URLs",
        verbose_name="รูป Insight (หลายรูป)"
    )
    insight_submitted_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When insight was last submitted",
        verbose_name="ส่ง Insight เมื่อ"
    )
    insight_feedback = models.TextField(
        blank=True,
        help_text="Admin feedback for insight",
        verbose_name="Feedback สำหรับ Insight"
    )
    insight_note = models.TextField(
        blank=True,
        help_text="Note from influencer when submitting insight",
        verbose_name="โน้ตการส่ง Insight"
    )
    
    # AI Analysis Data (stored from Insight image analysis)
    insight_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="AI Analysis results (likes, comments, sentiment, etc.)",
        verbose_name="ข้อมูลวิเคราะห์ Insight"
    )
    
    # Application note from user
    application_note = models.TextField(
        blank=True,
        help_text="Note from influencer when applying",
        verbose_name="โน้ตจากผู้สมัคร"
    )
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True, verbose_name="สมัครเมื่อ")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="อัปเดตเมื่อ")

    def save(self, *args, **kwargs):
        if self.pk:
            delete_old_file(self, 'payment_slip')
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'ใบสมัครแคมเปญ'
        verbose_name_plural = 'รายการใบสมัคร'
        ordering = ['-applied_at']
        unique_together = ['campaign', 'user']
    
    def __str__(self):
        return f"{self.user.display_name} - {self.campaign.title} ({self.status})"
    
    @property
    def current_stage(self):
        """Get current timeline stage based on status."""
        status_to_stage = {
            'WAITING': 'brief',
            'APPROVED': 'brief',
            'WORK_IN_PROGRESS': 'brief',
            'SUBMITTED_SCRIPT': 'script',
            'SCRIPT_APPROVED': 'script',
            'REVISE_SCRIPT': 'script',
            'SUBMITTED_DRAFT': 'draft',
            'DRAFT_APPROVED': 'draft',
            'REVISE_DRAFT': 'draft',
            'SUBMITTED_FINAL': 'final',
            'FINAL_APPROVED': 'insight',
            'REVISE_FINAL': 'final',
            'SUBMITTED_INSIGHT': 'insight',
            'REVISE_INSIGHT': 'insight',
            'INSIGHT_APPROVED': 'insight',
            'COMPLETED': 'payment',
            'PAYMENT_TRANSFERRED': 'payment',
        }
        return status_to_stage.get(self.status, 'brief')
    
    @property
    def is_working(self):
        """Check if user is actively working on this campaign."""
        working_statuses = [
            'APPROVED', 'WORK_IN_PROGRESS', 
            'SCRIPT_APPROVED', 'REVISE_SCRIPT',
            'DRAFT_APPROVED', 'REVISE_DRAFT',
            'FINAL_APPROVED', 'REVISE_FINAL',
            'REVISE_INSIGHT'
        ]
        return self.status in working_statuses
    
    @property
    def is_pending_review(self):
        """Check if submission is pending admin review."""
        pending_statuses = [
            'WAITING', 'SUBMITTED_SCRIPT', 
            'SUBMITTED_DRAFT', 'SUBMITTED_FINAL', 'SUBMITTED_INSIGHT'
        ]
        return self.status in pending_statuses
    
    def save(self, *args, **kwargs):
        """Override save to auto-update submission_data and send notifications."""
        from django.utils import timezone
        from apps.users.services import LineMessagingService
        
        # 1. Detect if status changed
        old_status = None
        if self.pk:
            try:
                old_instance = CampaignApplication.objects.get(pk=self.pk)
                old_status = old_instance.status
            except CampaignApplication.DoesNotExist:
                pass
        
        # 2. Auto-approve submission when status is changed to APPROVED status
        approval_mapping = {
            'SCRIPT_APPROVED': 'script',
            'DRAFT_APPROVED': 'draft',
            'SCRIPT_APPROVED': 'script',
            'DRAFT_APPROVED': 'draft',
            'FINAL_APPROVED': 'final',
            'INSIGHT_APPROVED': 'insight',
            'COMPLETED': 'insight', # Fallback
            'PAYMENT_TRANSFERRED': 'payment',
        }
        
        if self.status in approval_mapping:
            stage = approval_mapping[self.status]
            if stage in self.submission_data:
                data = self.submission_data[stage]
                
                # Handle List (Multi-Revision)
                if isinstance(data, list) and data:
                    latest = data[-1]
                    if latest.get('status') != 'approved':
                        latest['status'] = 'approved'
                        latest['reviewed_at'] = timezone.now().isoformat()
                        self.submission_data[stage][-1] = latest
                
                # Handle Dict (Legacy/Fallback)
                elif isinstance(data, dict):
                    if data.get('status') != 'approved':
                        self.submission_data[stage]['status'] = 'approved'
                        self.submission_data[stage]['reviewed_at'] = timezone.now().isoformat()
        
        # 3. Save the model
        super().save(*args, **kwargs)
        
        # 4. Convert status change for notifications
        # Only send if status actually changed
        if old_status and old_status != self.status:
            try:
                # We catch errors here so notification failure doesn't rollback transaction
                LineMessagingService.send_campaign_status_notification(self, old_status, self.status)
                print(f"✅ Notification sent: {self.user.display_name} ({old_status} -> {self.status})")
            except Exception as e:
                print(f"⚠️ Notification failed: {str(e)}")
    
    def submit_work(self, stage, link, notes=''):
        """
        Submit work for a specific stage.
        Supports multi-round revisions (Max 3 attempts) for script/draft/final.
        Insight uses simplified single-field structure.
        """
        from django.utils import timezone
        
        # Special handling for Insight - use dedicated fields
        if stage == 'insight':
            self.insight_image = link
            self.insight_note = notes  # Save the note!
            self.insight_submitted_at = timezone.now()
            self.insight_feedback = ''  # Clear previous feedback on new submission
            self.status = 'SUBMITTED_INSIGHT'
            self.save()
            return
        
        # For script/draft/final - use submission_data list structure
        # Ensure stage exists in submission_data as a list
        if stage not in self.submission_data or not isinstance(self.submission_data[stage], list):
            self.submission_data[stage] = []
        
        attempts = self.submission_data[stage]
        
        # Validation: Check max attempts
        if len(attempts) >= 3:
            raise ValueError("Maximum submission attempts (3) reached for this stage.")

        # Create new submission attempt
        new_attempt = {
            'round': len(attempts) + 1,
            'link': link,
            'notes': notes,
            'submitted_at': timezone.now().isoformat(),
            'status': 'pending',
            'feedback': None,
            'reviewed_at': None
        }
        
        attempts.append(new_attempt)
        self.submission_data[stage] = attempts
        
        # Update application status
        status_map = {
            'script': 'SUBMITTED_SCRIPT',
            'draft': 'SUBMITTED_DRAFT',
            'final': 'SUBMITTED_FINAL',
        }
        self.status = status_map.get(stage, self.status)
        self.save()
    
    def approve_stage(self, stage, feedback=''):
        """Approve the latest submission of a stage."""
        from django.utils import timezone
        
        # Special handling for Insight
        if stage == 'insight':
            self.insight_feedback = feedback
            self.status = 'COMPLETED'
            self.save()
            return
        
        # For script/draft/final
        if stage in self.submission_data and isinstance(self.submission_data[stage], list) and self.submission_data[stage]:
            # Get latest attempt
            latest_attempt = self.submission_data[stage][-1]
            latest_attempt['status'] = 'approved'
            latest_attempt['feedback'] = feedback
            latest_attempt['reviewed_at'] = timezone.now().isoformat()
            
            # Save back to list
            self.submission_data[stage][-1] = latest_attempt
        
        # Advance status
        status_map = {
            'script': 'SCRIPT_APPROVED',
            'draft': 'DRAFT_APPROVED',
            'final': 'FINAL_APPROVED',
        }
        self.status = status_map.get(stage, self.status)
        self.save()
    
    def request_revision(self, stage, feedback):
        """Request revision for the latest submission."""
        from django.utils import timezone
        
        # Special handling for Insight
        if stage == 'insight':
            self.insight_feedback = feedback
            self.status = 'REVISE_INSIGHT'
            self.save()
            return
        
        # For script/draft/final
        if stage in self.submission_data and isinstance(self.submission_data[stage], list) and self.submission_data[stage]:
            # Get latest attempt
            latest_attempt = self.submission_data[stage][-1]
            latest_attempt['status'] = 'revision_requested'
            latest_attempt['feedback'] = feedback
            latest_attempt['reviewed_at'] = timezone.now().isoformat()
            
            # Save back to list
            self.submission_data[stage][-1] = latest_attempt
        
        # Go back to workflow state
        revision_map = {
            'script': 'REVISE_SCRIPT',
            'draft': 'REVISE_DRAFT',
            'final': 'REVISE_FINAL',
        }
        self.status = revision_map.get(stage, self.status)
        self.save()


class CampaignInsightMetric(models.Model):
    """
    Detailed metrics extracted from insight submissions.
    Stored in a dedicated table for easier aggregation and reporting.
    """
    application = models.OneToOneField(
        CampaignApplication,
        on_delete=models.CASCADE,
        related_name='insight_metric'
    )
    
    # Raw Metrics
    total_views = models.BigIntegerField(default=0, help_text="Total views from all media")
    total_likes = models.BigIntegerField(default=0, help_text="Total likes")
    total_comments = models.BigIntegerField(default=0, help_text="Total comments")
    total_shares = models.BigIntegerField(default=0, help_text="Total shares/saves")
    
    # Calculated Metrics
    engagement_rate = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        help_text="Engagement Rate % ((Likes+Comments+Shares)/Views * 100)"
    )
    cost_per_view = models.DecimalField(
        max_digits=10, 
        decimal_places=4, 
        default=0.00,
        help_text="Cost Per View (Budget / Total Views)"
    )
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Metrics for App #{self.application.id}"
