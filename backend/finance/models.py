import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    household_id = models.CharField(max_length=100, db_index=True, default='default')

    def __str__(self):
        return self.username

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    icon = models.CharField(max_length=20, default="💰")

    def __str__(self):
        return self.name

class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    description = models.CharField(max_length=200)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='initiated_transactions')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    date = models.DateTimeField(default=timezone.now)
    receipt_url = models.URLField(blank=True, null=True)
    splitwise_id = models.CharField(max_length=100, unique=True, null=True, blank=True)

class SplitwiseLink(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='splitwise_link')
    oauth_token = models.CharField(max_length=255, help_text="OAuth Access Token")
    oauth_token_secret = models.CharField(max_length=255, help_text="OAuth Access Token Secret")

class Ledger(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='ledger_entries')
    
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='debts_outgoing')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='debts_incoming')
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_settlement = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['from_user', 'to_user', 'is_settlement']),
        ]

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='documents/', null=True, blank=True)
    text_content = models.TextField(blank=True, null=True, help_text="Raw text input (e.g. copied from messages)")
    extracted_text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)

    def __str__(self):
        return f"Document {self.id}"
