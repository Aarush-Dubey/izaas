from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import User, Category, Transaction, Ledger, Document, SplitwiseLink
from .serializers import UserSerializer, CategorySerializer, TransactionSerializer, LedgerSerializer, DocumentSerializer, SplitwiseLinkSerializer
from .utils import extract_text_from_file
from .splitwise_service import SplitwiseService
import random

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from dj_rest_auth.registration.views import SocialLoginView

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://127.0.0.1:8000/accounts/google/login/callback/"
    client_class = OAuth2Client

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class SplitwiseViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def connect(self, request):
        user_id = request.data.get('user_id')
        api_key = request.data.get('api_key')
        
        if not user_id or not api_key:
             return Response({"error": "Missing user_id or api_key"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
            link, created = SplitwiseLink.objects.update_or_create(
                user=user,
                defaults={'api_key': api_key}
            )
            return Response({"status": "connected", "created": created})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def sync(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
             return Response({"error": "Missing user_id"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            service = SplitwiseService(user)
            result = service.sync_expenses()
            return Response(result)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

class LedgerViewSet(viewsets.ModelViewSet):
    queryset = Ledger.objects.all()
    serializer_class = LedgerSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        
        extracted = ""
        if instance.file:
            extracted = extract_text_from_file(instance.file)
        elif instance.text_content:
            extracted = instance.text_content
        
        if extracted:
            instance.extracted_text = extracted
            instance.is_processed = True
            instance.save()

class ChatView(APIView):
    def post(self, request):
        user_message = request.data.get('message', '').lower()
        
        response_data = {
            "response": "I'm not sure how to help with that yet.",
            "ui_action": None
        }

        if 'spending' in user_message or 'entertainment' in user_message:
            response_data['response'] = "It looks like you had 3 large subscriptions renewed at once. See the breakdown."
            response_data['ui_action'] = {
                "type": "render",
                "component": "BarChart",
                "data": {
                    "labels": ["Netflix", "Hulu", "Spotify"],
                    "values": [15, 12, 10]
                },
                "props": {
                    "title": "Subscription Breakdown"
                }
            }
        elif 'transaction' in user_message or 'list' in user_message:
            response_data['response'] = "Here are your recent transactions."
            response_data['ui_action'] = {
                "type": "render",
                "component": "TransactionTable",
                "data": [
                    {"id": 1, "desc": "Costco", "amount": 200},
                    {"id": 2, "desc": "Uber", "amount": 45}
                ],
                "props": {
                     "sortable": True
                }
            }
        else:
             response_data['response'] = "I can help you analyze your spending or track transactions. Try asking 'Why is my receiving high?'"

        return Response(response_data, status=status.HTTP_200_OK)

@csrf_exempt
def dashboard_view(request):
    """
    Serves the AI-Native Canvas Dashboard (Django Template)
    """
    return render(request, 'finance/dashboard.html')
