from rest_framework import serializers
from .models import Contact
from django.contrib.auth.hashers import make_password

class ContactSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = Contact
        fields = ['username', 'email', 'phone', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')  # Remove confirm_password before saving
        validated_data['password'] = make_password(validated_data['password'])  # Hash password
        return super().create(**validated_data)
