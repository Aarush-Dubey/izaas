
import os
import json
from django.http import StreamingHttpResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from openai import OpenAI


# Initialize OpenAI client compatible with Thesys C1
client = OpenAI(
    base_url="https://api.thesys.dev/v1/embed",
    api_key=os.environ.get("THESYS_API_KEY", "sk-mock-key") # Use mock or env var
)

# Load Mock Data
try:
    # .../backend/ai_c1/views.py -> .../backend/ai_c1 -> .../backend -> .../izaas
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(base_dir, 'financial_data.json')
    with open(data_path, 'r') as f:
        MOCK_DATA = json.load(f)
except Exception as e:
    MOCK_DATA = {"error": f"Could not load data: {str(e)}"}

SYSTEM_PROMPT = f"""
You are a personalized financial co-pilot designed to help users understand their money, not just view transactions.

User questions may be vague, emotional, or incomplete. Your job is to infer intent rather than ask the user to restate clearly.

You have access to internal analytical capabilities such as trend analysis, categorization, anomaly detection, and comparison. Use them whenever reasoning alone is insufficient.

UI-FIRST RULES:
- If the question involves change over time, generate a timeline or trend chart UI.
- If the question involves spending breakdowns, generate a categorical table or chart UI.
- If something seems unusual, surface anomalies with visual context.
- If a decision is implied, generate a comparison UI.

INTERACTION RULES:
- Do not dump all information at once.
- Start with a focused view.
- Allow the user to zoom, filter, or drill down.
- Ask follow-up questions when intent is unclear.

OUTPUT CONSTRAINTS:
- Do NOT respond with markdown or long text explanations.
- Always generate interactive UI using C1 Generative UI format.
- Text should only appear as labels, annotations, or guidance within UI components.

Your goal is to move the user from:
“What is happening?” → “Why is it happening?” → “What should I do next?”

CONTEXT - USER FINANCIAL DATA:
{json.dumps(MOCK_DATA, indent=2)}
"""

# In-memory store for conversation history
# Format: { thread_id: [ {role, content}, ... ] }
conversations = {}

@method_decorator(csrf_exempt, name='dispatch')
class ChatView(View):
    def options(self, request, *args, **kwargs):
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    def post(self, request):
        try:
            data = json.loads(request.body)
            prompt = data.get('prompt')
            thread_id = data.get('threadId', 'default')
            
            if not prompt:
                return StreamingHttpResponse("Missing prompt", status=400)

            # Retrieve or initialize history
            if thread_id not in conversations:
                conversations[thread_id] = []
            
            history = conversations[thread_id]
            
            # Add user message to history
            history.append({"role": "user", "content": prompt})

            # Construct messages for API
            messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history

            # Create the stream
            stream = client.chat.completions.create(
                model="c1-model", 
                messages=messages,
                stream=True
            )

            def event_stream():
                full_response = ""
                for chunk in stream:
                    if chunk.choices[0].delta.content:
                        content_chunk = chunk.choices[0].delta.content
                        full_response += content_chunk
                        yield content_chunk
                
                # Append assistant response to history after streaming is done
                # Note: This runs in the generator, so it updates the global dict
                history.append({"role": "assistant", "content": full_response})

            response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
            response['Access-Control-Allow-Origin'] = '*'
            return response

        except Exception as e:
            response = StreamingHttpResponse(f"Error: {str(e)}", status=500)
            response['Access-Control-Allow-Origin'] = '*'
            return response
