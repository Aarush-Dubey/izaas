from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import User, Category, Transaction, Ledger, Document, SplitwiseLink
from .serializers import UserSerializer, CategorySerializer, TransactionSerializer, LedgerSerializer, DocumentSerializer, SplitwiseLinkSerializer
from .utils import extract_text_from_file
from .splitwise_service import SplitwiseService
from .splitwise_service import SplitwiseService
import random
import json

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

import sys
import os
sys.path.append(os.path.normpath(os.path.join(os.path.dirname(__file__), '../../middleware')))
from pipeline import FinancialPipeline
from agent import FinancialAnalystTool

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
            
        # Trigger Middleware
        try:
            # Use request.user.username (call sign)
            user_id = self.request.user.username if self.request.user.is_authenticated else "GUEST"
            pipeline = FinancialPipeline(user_id=user_id)
            if instance.file:
                pipeline.handle_upload(instance.file.path)
        except Exception as e:
            print(f"Middleware Error: {e}")

from django.http import StreamingHttpResponse
import time

class ChatView(APIView):
    """
    Handles chat requests and injects vision model context.
    Streams output in OpenAI-compatible format for C1Chat.
    """
    def post(self, request):
        prompt = request.data.get('prompt', '')
        # Simple Logic: Pass-through or integrate with LLM
        
        user_id = request.user.username if request.user.is_authenticated else "GUEST"
        base_dir = os.path.join(os.path.dirname(__file__), '../../data', user_id, 'uploads')
        
        vision_context = ""
        file_path_context = ""
        if os.path.exists(base_dir):
            # Find latest vision json
            json_files = [f for f in os.listdir(base_dir) if f.endswith('_vision.json')]
            if json_files:
                latest_json = max([os.path.join(base_dir, f) for f in json_files], key=os.path.getctime)
                try:
                    with open(latest_json, 'r') as f:
                        data = json.load(f)
                        vision_context = json.dumps(data.get("analysis", []), indent=2)
                        # Also get the original file path if available in JSON or derive it
                        original_file = data.get("file_path")
                        if original_file:
                             file_path_context = f"User uploaded a file available at: {original_file}"
                        print(f"[*] Injected context from {os.path.basename(latest_json)}")
                except Exception as e:
                    print(f"Error reading vision file: {e}")

        # Construct full prompt with context
        full_prompt = prompt
        context_parts = []
        if vision_context:
            context_parts.append(f"Context from uploaded document:\n{vision_context}")
        if file_path_context:
             context_parts.append(file_path_context)
        
        # Inject Transaction Data Context
        transactions_path = os.path.join(os.path.dirname(__file__), '../data', 'transactions.json')
        if os.path.exists(transactions_path):
            try:
                with open(transactions_path, 'r') as f:
                    txn_data = json.load(f)
                    txn_str = json.dumps(txn_data, indent=2)
                    context_parts.append(f"User Transaction Data:\n{txn_str}")
            except Exception as e:
                print(f"Error reading transaction file: {e}")

        if context_parts:
            full_prompt = "\n\n".join(context_parts) + f"\n\nUser Query: {prompt}"
        
        # Generator for Streaming Response
        def event_stream():
            # 1. Start (Role)
            chunk_id = f"chatcmpl-{int(time.time())}"
            start_chunk = {
                "id": chunk_id,
                "object": "chat.completion.chunk",
                "created": int(time.time()),
                "model": "izaas-agent",
                "choices": [{"index": 0, "delta": {"role": "assistant"}, "finish_reason": None}]
            }
            yield f"data: {json.dumps(start_chunk)}\n\n"
            
            # 2. Run Agent (This blocks, but that's okay for now)
            try:
                # We pass empty context to agent.run to avoid duplication since we manually built full_prompt.
                agent = FinancialAnalystTool(json_path=transactions_path)
                agent_response = agent.run(query=full_prompt, context="")
            except Exception as e:
                agent_response = f"I encountered an error analyzing the data: {str(e)}"

            # 3. Stream Content
            # For better UX, we could split by words, but for now sending full block or splitting by newlines
            import re
            tokens = re.split(r'(\s+)', agent_response) # Split interacting with spaces
            
            for token in tokens:
                chunk = {
                    "id": chunk_id,
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": "izaas-agent",
                    "choices": [{"index": 0, "delta": {"content": token}, "finish_reason": None}]
                }
                yield f"data: {json.dumps(chunk)}\n\n"
                # Small delay to simulate typing if running locally/fast
                # time.sleep(0.01) 

            # 4. Stop
            end_chunk = {
                "id": chunk_id,
                "object": "chat.completion.chunk",
                "created": int(time.time()),
                "model": "izaas-agent",
                "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}]
            }
            yield f"data: {json.dumps(end_chunk)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingHttpResponse(event_stream(), content_type='text/event-stream')

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Returns only transactions belonging to the authenticated user.
    """
    serializer_class = TransactionSerializer

    def get_queryset(self):
        # Assuming request.user is a Finance User instance
        return Transaction.objects.filter(payer=self.request.user)