from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User as FinanceUser

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_finance_user(sender, instance, created, **kwargs):
    if created:
        # Create a matching Finance User
        # We use email as the linker, assuming username might be email or arbitrary
        FinanceUser.objects.create(
            auth_user=instance,
            name=instance.username, # Or first_name + last_name
            email=instance.email,
            household_id='default_household'
        )
