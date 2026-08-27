"""
Auth Views
==========
All tokens are stored in httpOnly cookies — the frontend never
touches raw JWTs, which prevents XSS-based token theft.

Cookie names:
  access_token   — short-lived JWT (1 day)
  refresh_token  — long-lived JWT (7 days)
"""
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from .serializers import RegisterSerializer, UserSerializer


# ── helpers ───────────────────────────────────────────────────────────────────

ACCESS_MAX_AGE  = 60 * 60 * 24          # 1 day  (seconds)
REFRESH_MAX_AGE = 60 * 60 * 24 * 7     # 7 days (seconds)
COOKIE_SAMESITE = 'Lax'
COOKIE_SECURE   = False   # Set True in production (HTTPS only)


def _set_auth_cookies(response, refresh):
    """Attach access + refresh JWT tokens as httpOnly cookies on the response."""
    access = str(refresh.access_token)
    response.set_cookie(
        key='access_token',
        value=access,
        max_age=ACCESS_MAX_AGE,
        httponly=True,
        samesite=COOKIE_SAMESITE,
        secure=COOKIE_SECURE,
        path='/',
    )
    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        max_age=REFRESH_MAX_AGE,
        httponly=True,
        samesite=COOKIE_SAMESITE,
        secure=COOKIE_SECURE,
        path='/',
    )
    return response


def _clear_auth_cookies(response):
    """Delete auth cookies from the browser."""
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    return response


# ── views ─────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    """
    POST /api/auth/register/
    Body: { "name": "...", "email": "...", "password": "..." }
    """

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            # Flatten error messages for easy frontend consumption
            errors = {k: v[0] if isinstance(v, list) else v
                      for k, v in serializer.errors.items()}
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        response = Response(
            {'message': 'Account created successfully.', 'user': user_data},
            status=status.HTTP_201_CREATED,
        )
        return _set_auth_cookies(response, refresh)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Body: { "email": "...", "password": "..." }
    """

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'errors': {'general': 'Email and password are required.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Django uses username=email (set during registration)
        user = authenticate(request, username=email, password=password)
        if user is None:
            # Also try by email lookup in case username differs
            try:
                db_user = User.objects.get(email__iexact=email)
                user = authenticate(request, username=db_user.username, password=password)
            except User.DoesNotExist:
                pass

        if user is None:
            return Response(
                {'errors': {'general': 'Invalid email or password.'}},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {'errors': {'general': 'This account has been disabled.'}},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        response = Response(
            {'message': 'Logged in successfully.', 'user': user_data},
            status=status.HTTP_200_OK,
        )
        return _set_auth_cookies(response, refresh)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Clears auth cookies and blacklists the refresh token.
    """

    def post(self, request):
        response = Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)

        # Try to blacklist refresh token
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (TokenError, Exception):
                pass  # Already invalid — that's fine

        return _clear_auth_cookies(response)


class MeView(APIView):
    """
    GET /api/auth/me/
    Returns the currently authenticated user using the access_token cookie.
    Used by the frontend on page load to restore the session.
    """

    def get(self, request):
        # Manually authenticate from cookie (simplejwt reads Authorization header by default)
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return Response({'user': None}, status=status.HTTP_200_OK)

        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(access_token)
            user = jwt_auth.get_user(validated_token)
        except (InvalidToken, TokenError, Exception):
            response = Response({'user': None}, status=status.HTTP_200_OK)
            return _clear_auth_cookies(response)

        return Response({'user': UserSerializer(user).data}, status=status.HTTP_200_OK)


class GoogleAuthView(APIView):
    """
    POST /api/auth/google/
    Authenticate or register user using verified Google profile data.
    Body: { "email": "...", "name": "...", "google_id": "...", "avatar": "..." }
    """

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        name = request.data.get('name', '').strip()
        avatar = request.data.get('avatar', '')

        if not email:
            return Response(
                {'errors': {'general': 'Google account email is required.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Retrieve existing user or create a new one
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            # Also check if username=email exists
            user = User.objects.filter(username__iexact=email).first()

        if not user:
            parts = name.split(' ', 1)
            first_name = parts[0] if parts else 'Google'
            last_name = parts[1] if len(parts) > 1 else ''

            user = User.objects.create_user(
                username=email,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )
            user.set_unusable_password()
            user.save()
        else:
            # Update user's name if not set
            if name and not user.first_name:
                parts = name.split(' ', 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ''
                user.save()

        if not user.is_active:
            return Response(
                {'errors': {'general': 'This account has been disabled.'}},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        if avatar:
            user_data['avatar'] = avatar

        response = Response(
            {'message': 'Logged in with Google successfully.', 'user': user_data},
            status=status.HTTP_200_OK,
        )
        return _set_auth_cookies(response, refresh)

