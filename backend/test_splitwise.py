import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/"

def test_splitwise_connect_fail():
    print("\n--- Testing Splitwise Connect (Expected Fail) ---")
    url = f"{BASE_URL}splitwise/connect/"
    payload = {
        "user_id": "00000000-0000-0000-0000-000000000000", 
        "api_key": "dummy_key"
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_splitwise_connect_fail()
