import requests
import json

BASE_URL = "http://127.0.0.1:8000/dj-rest-auth/"

def test_registration():
    print("\n--- Testing Registration ---")
    url = f"{BASE_URL}registration/"
    # Email must be unique, so we randomize it
    import random
    rand_id = random.randint(1000, 9999)
    payload = {
        "username": f"user_{rand_id}",
        "email": f"user_{rand_id}@example.com",
        "password": "password123",
        "password2": "password123"
    }
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 201:
            print("Registration Success!")
            print(f"Token: {response.json().get('key') or 'JWT Cookie set'}")
        else:
            print(f"Failed. Status: {response.status_code}")
            print(f"Headers: {response.headers}")
            print(f"Content: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_login():
    print("\n--- Testing Login ---")
    # We can't easily test login without a known user, but we just created one above.
    # ideally we return the credentials from test_registration
    pass 

if __name__ == "__main__":
    test_registration()
