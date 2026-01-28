"""
Finance app URL configuration.
"""

from django.urls import path
from .views import (
    PayoutConfirmView,
    FinanceDashboardView,
    PendingPayoutsView,
    TaxReportExportView,
    TransactionListView,
    BulkPayoutConfirmView,
    InternalRevenueView,
)

app_name = 'finance'

urlpatterns = [
    path('payout/confirm/', PayoutConfirmView.as_view(), name='payout-confirm'),
    path('payout/bulk-confirm/', BulkPayoutConfirmView.as_view(), name='bulk-payout-confirm'),
    path('dashboard/', FinanceDashboardView.as_view(), name='dashboard'),
    path('pending-payouts/', PendingPayoutsView.as_view(), name='pending-payouts'),
    path('export/tax-report/', TaxReportExportView.as_view(), name='tax-report-export'),
    path('transactions/', TransactionListView.as_view(), name='transaction-list'),
    path('internal-revenue/', InternalRevenueView.as_view(), name='internal-revenue'),
    path('internal-revenue/settle/', InternalRevenueView.as_view(), name='internal-revenue-settle'),
]
