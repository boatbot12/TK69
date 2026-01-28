from rest_framework import viewsets, permissions, filters
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .models import AdminLog
from .serializers import AdminLogSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class IsSuperUser(permissions.BasePermission):
    """
    Allows access only to superusers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class AdminLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for Admin Activity Logs.
    Only accessible by superadmins.
    """
    queryset = AdminLog.objects.all()
    serializer_class = AdminLogSerializer
    permission_classes = [IsSuperUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['action_type', 'target_model']
    search_fields = ['target_str', 'details', 'actor__display_name', 'actor__email']
    ordering_fields = ['created_at']
