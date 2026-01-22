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
from dj_rest_auth.registration.views import SocialLoginView

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://127.0.0.1:8000/accounts/google/login/callback/"
    client_class = OAuth2Client

class SplitwiseViewSet(viewsets.ViewSet):
    """
    Splitwise OAuth 1.0a Authorization Flow + Sync
    """
    @action(detail=False, methods=['post', 'get'])
    def authorize(self, request):
        """
        Step 1: Get Authorize URL
        Frontend calls this to get the Splitwise Auth URL to redirect the user to.
        """
        import os
        from splitwiz import Splitwise
        
        try:
            # Initialize Client
            sObj = Splitwise(
                consumer_key=os.getenv("SPLITWISE_CONSUMER_KEY"),
                consumer_secret=os.getenv("SPLITWISE_CONSUMER_SECRET")
            )
            
            # Get Request Token and Redirect URL
            url, secret = sObj.getAuthorizeURL()
            
            # Save secret in session for the callback step
            # Note: For production use a proper cache/db key if session is flaky, 
            # but usually cookie-session works if user is authenticated or browser maintains cookies.
            request.session['splitwise_oauth_secret'] = secret
            request.session.save()
            
            return Response({"url": url})
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def callback(self, request):
        """
        Step 2: Exchange Tokens and Sync
        Frontend receives 'oauth_token' and 'oauth_verifier' from Splitwise redirect.
        It sends them here to finalize auth and trigger sync.
        """
        oauth_token = request.data.get('oauth_token')
        oauth_verifier = request.data.get('oauth_verifier')
        
        # Verify user is logged in (if needed) - using request.user
        if not request.user.is_authenticated:
             return Response({"error": "User must be authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        # Retrieve secret from session
        oauth_token_secret = request.session.get('splitwise_oauth_secret')
        
        if not oauth_token or not oauth_verifier or not oauth_token_secret:
             return Response({"error": "Missing oauth tokens or session expired"}, status=status.HTTP_400_BAD_REQUEST)

        import os
        from splitwiz import Splitwise
        
        try:
            sObj = Splitwise(
                consumer_key=os.getenv("SPLITWISE_CONSUMER_KEY"),
                consumer_secret=os.getenv("SPLITWISE_CONSUMER_SECRET")
            )
            
            # Exchange for Access Token
            access_token = sObj.getAccessToken(oauth_token, oauth_token_secret, oauth_verifier)
            
            # Save Authorization to DB
            SplitwiseLink.objects.update_or_create(
                user=request.user,
                defaults={
                    'oauth_token': access_token['oauth_token'],
                    'oauth_token_secret': access_token['oauth_token_secret']
                }
            )
            
            # Trigger Sync
            service = SplitwiseService(request.user)
            result = service.sync_expenses()
            
            return Response({
                "status": "connected_and_synced", 
                "sync_result": result
            })
            
        except Exception as e:
            return Response({"error": f"Auth failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


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

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Returns only transactions belonging to the authenticated user.
    """
    serializer_class = TransactionSerializer

    def get_queryset(self):
        # Assuming request.user is a Finance User instance
        return Transaction.objects.filter(payer=self.request.user)