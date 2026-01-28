"""
API Serializers
"""

from rest_framework import serializers
from apps.users.models import User
from apps.influencers.models import Interest, InfluencerProfile, SocialPlatformAccount, BlacklistedInfluencer
from apps.campaigns.models import Campaign, CampaignApplication


class InterestSerializer(serializers.ModelSerializer):
    """Serializer for Interest categories."""
    
    class Meta:
        model = Interest
        fields = ['id', 'name', 'name_th', 'icon', 'image']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    has_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'line_user_id', 'display_name', 'is_superuser', 'is_staff',
            'picture_url', 'status', 'has_profile'
        ]
    
    def get_has_profile(self, obj):
        return hasattr(obj, 'profile')


class UserWithProfileSerializer(serializers.ModelSerializer):
    """Serializer for User with profile information."""
    
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'line_user_id', 'display_name', 'is_superuser', 'is_staff',
            'picture_url', 'status', 'profile'
        ]
    
    def get_profile(self, obj):
        if hasattr(obj, 'profile'):
            p = obj.profile
            request = self.context.get('request')
            return {
                'id': p.id,
                'full_name_th': p.full_name_th,
                'phone': p.phone,
                'email': p.email,
                'date_of_birth': str(p.date_of_birth) if p.date_of_birth else None,
                # Address fields
                'house_no': p.house_no,
                'village': p.village,
                'moo': p.moo,
                'soi': p.soi,
                'road': p.road,
                'sub_district': p.sub_district,
                'district': p.district,
                'province': p.province,
                'zipcode': p.zipcode,
                # Work conditions
                'allow_boost': p.allow_boost,
                'boost_price': str(p.boost_price) if p.boost_price is not None else None,
                'allow_original_file': p.allow_original_file,
                'original_file_price': str(p.original_file_price) if p.original_file_price is not None else None,
                'accept_gifted_video': p.accept_gifted_video,
                'accept_affiliate': p.accept_affiliate,
                # Interests
                'interests': p.interest_list,
                # Document URLs
                'id_card_front_url': request.build_absolute_uri(p.id_card_front.url) if p.id_card_front and request else (p.id_card_front.url if p.id_card_front else None),
                'bank_book_url': request.build_absolute_uri(p.bank_book.url) if p.bank_book and request else (p.bank_book.url if p.bank_book else None),
            }
        return None


class RegistrationSerializer(serializers.Serializer):
    """Serializer for registration form submission."""
    
    # Step 1: Interests
    interests = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
        max_length=3
    )
    
    # Step 2: Work Conditions
    allow_boost = serializers.BooleanField(default=False)
    boost_price = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False,
        allow_null=True
    )
    allow_original_file = serializers.BooleanField(default=False)
    original_file_price = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False,
        allow_null=True
    )
    accept_gifted_video = serializers.BooleanField(default=False)
    accept_affiliate = serializers.BooleanField(default=False)
    
    # Step 3: Personal Info
    full_name_th = serializers.CharField(max_length=100)
    phone = serializers.RegexField(
        regex=r'^0\d{9}$',
        error_messages={'invalid': 'Phone must be 10 digits starting with 0'}
    )
    email = serializers.EmailField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField()
    
    # Address
    house_no = serializers.CharField(max_length=50)
    village = serializers.CharField(max_length=100, required=False, allow_blank=True)
    moo = serializers.CharField(max_length=20, required=False, allow_blank=True)
    soi = serializers.CharField(max_length=100, required=False, allow_blank=True)
    road = serializers.CharField(max_length=100, required=False, allow_blank=True)
    sub_district = serializers.CharField(max_length=100)
    district = serializers.CharField(max_length=100)
    province = serializers.CharField(max_length=100)
    zipcode = serializers.RegexField(
        regex=r'^\d{5}$',
        error_messages={'invalid': 'Zipcode must be 5 digits'}
    )
    
    # Files
    id_card_front = serializers.ImageField(
        error_messages={'required': 'กรุณาอัปโหลดรูปบัตรประชาชน'}
    )
    bank_book = serializers.ImageField(
        error_messages={'required': 'กรุณาอัปโหลดรูปหน้าสมุดบัญชี'}
    )
    
    def validate(self, data):
        """Custom validation."""
        # Validate boost price if boost is allowed
        if data.get('allow_boost') and not data.get('boost_price'):
            raise serializers.ValidationError({
                'boost_price': 'Boost price is required when boost is allowed'
            })
        
        # Validate original file price
        if data.get('allow_original_file') and not data.get('original_file_price'):
            raise serializers.ValidationError({
                'original_file_price': 'Original file price is required when original file is allowed'
            })
        
        # Validate age (must be 18+)
        from datetime import date
        today = date.today()
        dob = data.get('date_of_birth')
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if age < 18:
            raise serializers.ValidationError({
                'date_of_birth': 'You must be at least 18 years old'
            })
        
        return data


class CampaignListSerializer(serializers.ModelSerializer):
    """Serializer for campaign list view."""
    

    user_status = serializers.SerializerMethodField()
    priority = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'uuid', 'title', 'brand_name', 'brand_logo', 'cover_image',
            'description', 'budget',
            'application_deadline', 'content_deadline',
            'script_deadline', 'draft_deadline', 'final_deadline',
            'status', 'user_status', 'priority', 'requirements',
            'location', 'followers_required', 'brief_url'
        ]
    
    def get_user_status(self, obj):
        """Get user's application status for this campaign."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                application = obj.applications.get(user=request.user)
                return application.status
            except CampaignApplication.DoesNotExist:
                return None
        return None
    
    def get_priority(self, obj):
        """Calculate display priority for sorting."""
        user_status = self.get_user_status(obj)
        
        if user_status in ['APPROVED', 'WORK_IN_PROGRESS', 'SCRIPT_APPROVED', 'DRAFT_APPROVED']:
            return 1  # Active work
        elif user_status in ['WAITING', 'SUBMITTED_SCRIPT', 'SUBMITTED_DRAFT', 'SUBMITTED_FINAL']:
            return 2  # Pending review
        elif user_status == 'COMPLETED':
            return 3  # Waiting for payment
        elif user_status == 'PAYMENT_TRANSFERRED':
            return 5  # Finished (History - should be last)
        elif obj.status == 'OPEN':
            return 4  # Open for applications (Not applied)
        else:
            return 6  # Closed


class CampaignDetailSerializer(serializers.ModelSerializer):
    """Serializer for campaign detail view."""
    

    user_application = serializers.SerializerMethodField()
    timeline_stages = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'uuid', 'title', 'brand_name', 'brand_logo', 'cover_image',
            'description', 'full_description',
            'budget', 'show_slip_to_client',
            'application_deadline', 'content_deadline',
            'script_deadline', 'draft_deadline', 'final_deadline',
            'status', 'requirements', 'brief_url',
            'timeline_stages', 'user_application'
        ]
    
    def get_timeline_stages(self, obj):
        """Get timeline stages configuration."""
        return [
            {
                'id': 'brief',
                'name': 'Brief',
                'name_th': 'รับบรีฟ',
                'icon': '📋',
                'description': 'Review campaign brief and requirements'
            },
            {
                'id': 'script',
                'name': 'Script',
                'name_th': 'สคริปต์',
                'icon': '📝',
                'description': 'Submit content script for approval'
            },
            {
                'id': 'draft',
                'name': 'Draft',
                'name_th': 'Draft',
                'icon': '🎬',
                'description': 'Submit draft content for review'
            },
            {
                'id': 'final',
                'name': 'Final',
                'name_th': 'เผยแพร่',
                'icon': '✅',
                'description': 'Publish final content'
            }
        ]
    
    def get_user_application(self, obj):
        """Get user's application details."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                application = obj.applications.get(user=request.user)
                return {
                    'id': application.id,
                    'status': application.status,
                    'current_stage': application.current_stage,
                    'applied_at': application.applied_at,
                    'submissions': application.submission_data,
                    'payment_slip': request.build_absolute_uri(application.payment_slip.url) if application.payment_slip else None,
                    # Insight data (simplified structure)
                    'insight_image': application.insight_image,
                    'insight_files': application.insight_files,
                    'insight_note': getattr(application, 'insight_note', ''),
                    'insight_submitted_at': application.insight_submitted_at.isoformat() if application.insight_submitted_at else None,
                    'insight_feedback': application.insight_feedback,
                }
            except CampaignApplication.DoesNotExist:
                return None
        return None


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer for user's campaign applications."""
    
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)
    campaign_brand = serializers.CharField(source='campaign.brand_name', read_only=True)
    current_stage = serializers.CharField(read_only=True)
    
    class Meta:
        model = CampaignApplication
        fields = [
            'id', 'campaign', 'campaign_title', 'campaign_brand',
            'status', 'current_stage', 'submission_data', 'payment_slip',
            'applied_at', 'updated_at'
        ]


class SubmitWorkSerializer(serializers.Serializer):
    """Serializer for work submission."""
    
    stage = serializers.ChoiceField(choices=['script', 'draft', 'final', 'insight'])
    link = serializers.CharField(required=False, allow_blank=True)  # Changed to CharField to be more flexible, made optional
    file = serializers.ImageField(required=False)  # For Insight upload
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate that either link or file is provided."""
        request = self.context.get('request')
        has_new_files = request and ('files' in request.FILES or 'file' in request.FILES)
        has_kept_files = request and 'kept_files' in request.data
        
        if not data.get('link') and not data.get('file') and not has_new_files and not has_kept_files:
            raise serializers.ValidationError("Either link or file must be provided")
        return data


class ValidateDriveLinkSerializer(serializers.Serializer):
    """Serializer for Google Drive link validation."""
    
    link = serializers.URLField()


class SocialPlatformAccountSerializer(serializers.ModelSerializer):
    """Serializer for connected social media accounts."""
    
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)
    followers_formatted = serializers.CharField(read_only=True)
    
    class Meta:
        model = SocialPlatformAccount
        fields = [
            'id', 'platform', 'platform_display', 'platform_user_id',
            'username', 'profile_url', 'profile_picture_url',
            'followers_count', 'followers_formatted', 'following_count',
            'posts_count', 'is_verified', 'connected_at', 'last_synced_at'
        ]
        read_only_fields = [
            'id', 'platform_user_id', 'username', 'profile_picture_url',
            'followers_count', 'following_count', 'posts_count', 
            'is_verified', 'connected_at', 'last_synced_at'
        ]


class SocialConnectSerializer(serializers.Serializer):
    """Connect a new social media account."""
    platform = serializers.ChoiceField(choices=SocialPlatformAccount.PLATFORM_CHOICES)
    profile_url = serializers.URLField()


class InfluencerApprovalSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for Admin Influencer Approval Dashboard.
    Consolidates data from User, Profile, and Social Accounts.
    """
    profile = serializers.SerializerMethodField()
    social_accounts = SocialPlatformAccountSerializer(many=True, read_only=True)
    blacklist_matches = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'line_user_id', 'display_name', 'is_superuser', 'picture_url', 
            'status', 'created_at', 'profile', 'social_accounts',
            'blacklist_matches'
        ]

    def get_profile(self, obj):
        if hasattr(obj, 'profile'):
            p = obj.profile
            request = self.context.get('request')
            return {
                'id': p.id,
                'full_name_th': p.full_name_th,
                'identification_number': p.identification_number,
                'bank_name': p.bank_name,
                'bank_account_number': p.bank_account_number,
                'phone': p.phone,
                'email': p.email,
                'date_of_birth': str(p.date_of_birth) if p.date_of_birth else None,
                'house_no': p.house_no,
                'village': p.village,
                'moo': p.moo,
                'soi': p.soi,
                'road': p.road,
                'sub_district': p.sub_district,
                'district': p.district,
                'province': p.province,
                'zipcode': p.zipcode,
                'full_address': p.full_address,
                'allow_boost': p.allow_boost,
                'boost_price': str(p.boost_price) if p.boost_price is not None else None,
                'allow_original_file': p.allow_original_file,
                'original_file_price': str(p.original_file_price) if p.original_file_price is not None else None,
                'accept_gifted_video': p.accept_gifted_video,
                'accept_affiliate': p.accept_affiliate,
                'interests': InterestSerializer(p.interests.all(), many=True).data,
                'id_card_front_url': request.build_absolute_uri(p.id_card_front.url) if p.id_card_front and request else (p.id_card_front.url if p.id_card_front else None),
                'bank_book_url': request.build_absolute_uri(p.bank_book.url) if p.bank_book and request else (p.bank_book.url if p.bank_book else None),
            }
        return None

    def get_blacklist_matches(self, obj):
        """
        Check for potential matches in the BlacklistedInfluencer table.
        Matches by: Phone, TikTok Username, or Name.
        """
        matches = []
        if not hasattr(obj, 'profile'):
            return matches

        p = obj.profile
        
        # 1. Match by Phone
        phone_matches = BlacklistedInfluencer.objects.filter(phone=p.phone)
        for m in phone_matches:
            matches.append({"type": "PHONE", "info": m.phone, "reason": m.reason})

        # 2. Match by TikTok Username
        social_accounts = obj.social_accounts.all()
        tiktok_acc = social_accounts.filter(platform='tiktok').first()
        if tiktok_acc:
            # Clean username for matching (remove @ if present)
            clean_username = tiktok_acc.username.replace('@', '')
            tiktok_matches = BlacklistedInfluencer.objects.filter(tiktok_name__icontains=clean_username)
            for m in tiktok_matches:
                matches.append({"type": "TIKTOK", "info": m.tiktok_name, "reason": m.reason})

        # 3. Match by Name (Fuzzy/Partial)
        if p.full_name_th:
            name_matches = BlacklistedInfluencer.objects.filter(name__icontains=p.full_name_th)
            for m in name_matches:
                # Avoid duplicate if already matched by phone
                if not any(dm['type'] == 'PHONE' for dm in matches):
                    matches.append({"type": "NAME", "info": m.name, "reason": m.reason})

        return matches


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating influencer profile."""
    interests = serializers.ListField(child=serializers.CharField(), required=False)
    social_accounts = serializers.JSONField(required=False)
    
    class Meta:
        model = InfluencerProfile
        fields = [
            'full_name_th', 'phone', 'email', 'date_of_birth',
            'house_no', 'village', 'moo', 'soi', 'road',
            'sub_district', 'district', 'province', 'zipcode',
            'allow_boost', 'boost_price', 'allow_original_file', 'original_file_price',
            'accept_gifted_video', 'accept_affiliate',
            'id_card_front', 'bank_book', 'interests', 'social_accounts'
        ]
        extra_kwargs = {
            'id_card_front': {'required': False},
            'bank_book': {'required': False},
        }

    def to_internal_value(self, data):
        """Pre-process data for boolean strings, pricing logic, and JSON fields."""
        # Handle JSON strings from multipart
        import json
        mutable_data = data.copy() if hasattr(data, 'copy') else data.dict().copy() if hasattr(data, 'dict') else dict(data)
        
        for field in ['interests', 'social_accounts']:
            if field in mutable_data and isinstance(mutable_data[field], str):
                try:
                    mutable_data[field] = json.loads(mutable_data[field])
                except:
                    pass
        
        ret = super().to_internal_value(mutable_data)
        
        # Helper for multipart booleans
        def force_bool(val):
            if val is None: return False
            if isinstance(val, bool): return val
            if isinstance(val, str): return val.lower() in ('true', '1', 'yes')
            return bool(val)

        # Force allow flags if price is provided (defensive logic)
        # We check the raw data because 'ret' might have stripped them if validation failed
        raw_boost_price = mutable_data.get('boost_price')
        if raw_boost_price and str(raw_boost_price).strip() != '':
             try:
                 price_val = Decimal(str(raw_boost_price))
                 if price_val > 0:
                     ret['allow_boost'] = True
             except:
                 pass
                 
        raw_orig_price = mutable_data.get('original_file_price')
        if raw_orig_price and str(raw_orig_price).strip() != '':
            try:
                price_val = Decimal(str(raw_orig_price))
                if price_val > 0:
                    ret['allow_original_file'] = True
            except:
                pass

        return ret

    def update(self, instance, validated_data):
        # We handle interests and social_accounts in the view for now 
        # to match existing complex logic, but we could move it here later.
        interests_data = validated_data.pop('interests', None)
        social_data = validated_data.pop('social_accounts', None)
        
        # Standard fields update
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class CampaignCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating campaigns (Admin only)."""
    
    brand_logo = serializers.ImageField(required=True)
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'brand_name', 'brand_logo', 'cover_image',
            'description', 'full_description', 
            'budget', 'location', 'show_slip_to_client', 'followers_required', 'brief_url',
            'application_deadline', 'content_deadline',
            'application_deadline', 'content_deadline',
            'script_deadline', 'draft_deadline', 'final_deadline', 'insight_deadline',
            'requirements', 'status'
        ]

class CampaignUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating campaigns."""
    brand_logo = serializers.ImageField(required=False, allow_null=True)
    cover_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'brand_name', 'brand_logo', 'cover_image',
            'description', 'full_description', 
            'budget', 'location', 'show_slip_to_client', 'followers_required', 'brief_url',
            'application_deadline', 'content_deadline',
            'script_deadline', 'draft_deadline', 'final_deadline', 'insight_deadline',
            'requirements', 'status'
        ]
