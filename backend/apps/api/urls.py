"""
API URL Configuration
"""

from django.urls import path
from . import views
from apps.audit_logs.views import AdminLogViewSet

urlpatterns = [
    # Authentication
    path('auth/line-login/', views.LineLoginView.as_view(), name='line-login'),
    path('auth/me/', views.CurrentUserView.as_view(), name='current-user'),
    
    # Registration
    path('register/interests/', views.InterestListView.as_view(), name='interest-list'),
    path('register/submit/', views.RegistrationSubmitView.as_view(), name='registration-submit'),
    
    # Profile
    path('profile/update/', views.ProfileUpdateView.as_view(), name='profile-update'),
    
    # Campaigns
    path('campaigns/', views.CampaignListView.as_view(), name='campaign-list'),
    path('campaigns/<str:uuid>/', views.CampaignDetailView.as_view(), name='campaign-detail'),
    path('campaigns/<str:uuid>/apply/', views.CampaignApplyView.as_view(), name='campaign-apply'),
    
    # Applications
    path('applications/', views.UserApplicationsView.as_view(), name='user-applications'),
    path('applications/<int:pk>/submit/', views.SubmitWorkView.as_view(), name='submit-work'),
    
    # Utilities
    path('validate-drive-link/', views.ValidateDriveLinkView.as_view(), name='validate-drive-link'),
    
    # Health check
    path('health/', views.HealthCheckView.as_view(), name='health-check'),
    
    # Public Shared Campaign (for clients/brands)
    path('shared/campaign/<str:token>/', views.SharedCampaignView.as_view(), name='shared-campaign'),
    path('shared/campaign/<str:token>/export/', views.SharedCampaignExportView.as_view(), name='shared-campaign-export'),
    
    # Messaging
    path('messaging/send/', views.SendMessageView.as_view(), name='send-message'),
    
    # Social Media Connections
    path('social/accounts/', views.SocialAccountsListView.as_view(), name='social-accounts-list'),
    path('social/connect/', views.SocialConnectView.as_view(), name='social-connect'),
    path('social/accounts/<int:pk>/', views.SocialDisconnectView.as_view(), name='social-disconnect'),
    path('social/accounts/<int:pk>/sync/', views.SocialSyncView.as_view(), name='social-sync'),
    
    # Utils
    path('utils/proxy-image/', views.ImageProxyView.as_view(), name='proxy-image'),
    path('utils/fetch-social-info/', views.SocialInfoFetchView.as_view(), name='fetch-social-info'),
    
    # Admin Influencer Approval Dashboard
    path('admin/approvals/influencers/', views.InfluencerApprovalListView.as_view(), name='admin-influencer-approvals'),
    path('admin/approvals/bulk-action/', views.BulkInfluencerActionView.as_view(), name='admin-bulk-action'),
    


    # Admin Campaign Management
    path('admin/campaigns/', views.AdminCampaignListView.as_view(), name='admin-campaign-list'),
    path('admin/campaigns/create/', views.AdminCampaignCreateView.as_view(), name='admin-campaign-create'),
    path('admin/campaigns/generate-follow-up/', views.GenerateFollowUpView.as_view(), name='generate-follow-up'),
    path('admin/campaigns/send-bulk-message/', views.BulkSendMessageView.as_view(), name='send-bulk-message'),
    path('admin/campaigns/<str:uuid>/', views.AdminCampaignDetailView.as_view(), name='admin-campaign-detail'),
    path('admin/campaigns/<str:uuid>/export/', views.AdminExportParticipantsView.as_view(), name='admin-campaign-export'),
    path('admin/campaigns/<str:uuid>/import/', views.AdminImportParticipantsView.as_view(), name='admin-campaign-import'),
    path('admin/campaigns/<str:uuid>/share-link/', views.AdminCampaignShareLinkView.as_view(), name='admin-campaign-share-link'),
    path('admin/campaigns/applications/bulk-action/', views.BulkApplicationActionView.as_view(), name='admin-campaign-app-bulk-action'),
    path('admin/campaigns/applications/<int:pk>/review/', views.AdminWorkReviewView.as_view(), name='admin-work-review'),

    
    # Audit Logs
    path('admin/audit-logs/', AdminLogViewSet.as_view({'get': 'list'}), name='admin-audit-logs'),
    
    # Admin Profile Update
    path('admin/influencers/<int:pk>/update/', views.AdminUpdateInfluencerProfileView.as_view(), name='admin-influencer-update'),
]

