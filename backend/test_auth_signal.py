import os
import django
from django.contrib.auth import get_user_model

# Ensure settings are configured
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'izaas_backend.settings')
django.setup()

from finance.models import User as FinanceUser

def test_user_creation():
    print("--- Testing User Creation and Signal ---")
    User = get_user_model()
    email = "testuser@example.com"
    
    # Clean up previous runs
    try:
        u = User.objects.get(username="testuser")
        u.delete()
        print("Cleaned up old user.")
    except User.DoesNotExist:
        pass
    
    # Create Auth User
    user = User.objects.create_user(username="testuser", email=email, password="password123")
    print(f"Auth User Created: {user.username} ({user.id})")

    # Check if Finance User was created by Signal
    try:
        f_user = FinanceUser.objects.get(auth_user=user)
        print(f"Finance User Created (Signal Success): {f_user.name} ({f_user.id})")
        print(f"Linked Email: {f_user.email}")
    except FinanceUser.DoesNotExist:
        print("FAILED: Finance User was not created.")

if __name__ == "__main__":
    test_user_creation()
