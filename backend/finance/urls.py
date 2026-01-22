from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, SplitwiseViewSet, GoogleLogin

router = DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'splitwise', SplitwiseViewSet, basename='splitwise')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
]
