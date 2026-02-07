"""
Test the API endpoint directly
"""
import requests
import json

# Test configuration
BASE_URL = "http://localhost:8001/api"
ROOM_ID = "fb1fbc9f-18ff-4ea3-b86f-0a420e9e7ac9"  # Ghhh room
USER_ID = "3f651349-b52e-4ed6-96a9-6dd4a63b71c7"  # Rag user

# First, login to get token
print("=" * 60)
print("TEST API ENDPOINT")
print("=" * 60)

# Login
print("\n1. Logging in...")
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "rag@test.com",  # Adjust email
        "password": "password123"  # Adjust password
    }
)

if login_response.status_code == 200:
    token = login_response.json().get("access_token")
    print(f"✅ Login successful, got token")
else:
    print(f"❌ Login failed: {login_response.status_code}")
    print(f"Response: {login_response.text}")
    exit(1)

# Get tickets
print(f"\n2. Getting tickets for room {ROOM_ID}...")
headers = {"Authorization": f"Bearer {token}"}
tickets_response = requests.get(
    f"{BASE_URL}/tickets/my-tickets/{ROOM_ID}",
    headers=headers
)

print(f"Status Code: {tickets_response.status_code}")
print(f"Response Headers: {dict(tickets_response.headers)}")
print(f"Response Text: {tickets_response.text[:500]}")

if tickets_response.status_code == 200:
    try:
        tickets = tickets_response.json()
        print(f"\n✅ Got {len(tickets)} tickets")
        if tickets:
            print(f"First ticket: {json.dumps(tickets[0], indent=2)}")
    except Exception as e:
        print(f"❌ Error parsing JSON: {e}")
else:
    print(f"❌ Request failed: {tickets_response.status_code}")

print("\n" + "=" * 60)
