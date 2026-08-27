from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    """Validate and create a new user account."""

    name = serializers.CharField(max_length=150, write_only=True)
    password = serializers.CharField(
        write_only=True, min_length=6,
        style={'input_type': 'password'},
        error_messages={'min_length': 'Password must be at least 6 characters.'},
    )

    class Meta:
        model = User
        fields = ['name', 'email', 'password']

    def validate_email(self, value):
        """Ensure email is unique."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value.lower()

    def create(self, validated_data):
        name = validated_data.pop('name', '').strip()
        email = validated_data['email']

        # Split name into first/last for Django's User model
        parts = name.split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        user = User.objects.create_user(
            username=email,          # use email as username
            email=email,
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Public user data returned after login / on /me/ endpoint."""

    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email']

    def get_name(self, obj):
        full = f'{obj.first_name} {obj.last_name}'.strip()
        return full or obj.username
