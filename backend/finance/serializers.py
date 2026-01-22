from rest_framework import serializers
from .models import User, Category, Transaction, Ledger, Document, SplitwiseLink

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    class Meta:
        model = Transaction
        fields = '__all__'

class LedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ledger
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class SplitwiseLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SplitwiseLink
        fields = ['api_key']
