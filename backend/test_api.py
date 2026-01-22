import requests
import json

def test_chat():
    url = "http://127.0.0.1:8000/api/chat/"
    payload = {"message": "Why is my spending so high?"}
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print("Response:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chat()
