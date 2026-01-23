import sys
import os
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import User

# Add middleware path
sys.path.append(os.path.normpath(os.path.join(os.path.dirname(__file__), '../../middleware')))
from pipeline import FinancialPipeline

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal to create a file system profile for the user when they register.
    """
    if created:
        print(f"[*] New user created: {instance.username}. Initializing profile...")
        try:
            # Use username as the identifier for the folder
            pipeline = FinancialPipeline(user_id=instance.username)
            pipeline.create_profile()
            print(f"[+] Profile successfully created for {instance.username}")
        except Exception as e:
            print(f"[-] Error creating profile for {instance.username}: {e}")
