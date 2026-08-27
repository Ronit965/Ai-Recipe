"""
Users App — JWT-based Authentication
=====================================
Provides:
  POST /api/auth/register/   — create account
  POST /api/auth/login/      — get JWT tokens (stored in httpOnly cookies)
  POST /api/auth/logout/     — clear tokens
  GET  /api/auth/me/         — return current user (from cookie)
"""
