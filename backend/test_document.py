import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/"

def test_raw_text_upload():
    print("\n--- Testing Raw Text Upload ---")
    url = f"{BASE_URL}documents/"
    payload = {
        "text_content": "Paid $50 for Groceries at Walmart on 2023-10-27."
    }
    try:
        response = requests.post(url, data=payload)
        if response.status_code == 201:
            data = response.json()
            print("Success!")
            print(f"ID: {data['id']}")
            print(f"Extracted Text: {data['extracted_text']}")
        else:
            print(f"Failed. Status: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_raw_text_upload()
