from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CategoryViewSet, TransactionViewSet, LedgerViewSet, ChatView, DocumentViewSet, SplitwiseViewSet, GoogleLogin, dashboard_view

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'ledger', LedgerViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'splitwise', SplitwiseViewSet, basename='splitwise')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/chat/', ChatView.as_view(), name='chat'),
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
]
