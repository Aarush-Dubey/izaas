from django.db import models
from .models import User
import uuid

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    file = models.FileField(upload_to='documents/', null=True, blank=True)
    text_content = models.TextField(blank=True, null=True, help_text="Raw text input (e.g. copied from messages)")
    extracted_text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)

    def __str__(self):
        return f"Document {self.id} ({'Processed' if self.is_processed else 'Pending'})"
