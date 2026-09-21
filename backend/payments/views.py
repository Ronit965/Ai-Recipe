import os
import hmac
import hashlib
import time
from datetime import datetime, timedelta

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

try:
    import razorpay
except ImportError:
    razorpay = None


def get_razorpay_client():
    key_id = os.getenv('RAZORPAY_KEY_ID', '').strip()
    key_secret = os.getenv('RAZORPAY_KEY_SECRET', '').strip()
    if key_id and key_secret and razorpay:
        return razorpay.Client(auth=(key_id, key_secret)), key_id, key_secret
    return None, key_id, key_secret


class CreateOrderView(APIView):
    """
    POST /api/payments/create-order/
    Body: { "plan_id": "monthly"|"yearly"|"lifetime", "amount": 300, "currency": "INR"|"USD", "plan_name": "..." }
    """

    def post(self, request):
        plan_id = request.data.get('plan_id', 'monthly')
        plan_name = request.data.get('plan_name', 'Monthly Pro')
        currency = request.data.get('currency', 'INR').upper()
        raw_amount = request.data.get('amount')

        try:
            amount_val = float(raw_amount)
        except (TypeError, ValueError):
            # Default plan pricing
            defaults = {
                'monthly': 300 if currency == 'INR' else 3,
                'yearly': 3000 if currency == 'INR' else 30,
                'lifetime': 30000 if currency == 'INR' else 300,
            }
            amount_val = defaults.get(plan_id, 300)

        # Razorpay expects amount in smallest currency unit (e.g. paise for INR, cents for USD)
        amount_in_subunits = int(round(amount_val * 100))

        client, key_id, key_secret = get_razorpay_client()

        if client and key_id:
            try:
                order_data = {
                    'amount': amount_in_subunits,
                    'currency': currency,
                    'receipt': f'rcpt_{plan_id}_{int(time.time())}',
                    'notes': {
                        'plan_id': plan_id,
                        'plan_name': plan_name,
                    }
                }
                order = client.order.create(data=order_data)
                return Response({
                    'status': 'success',
                    'order_id': order['id'],
                    'amount': order['amount'],
                    'currency': order['currency'],
                    'key_id': key_id,
                    'mock': False
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'status': 'error',
                    'message': f'Razorpay order creation failed: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Fallback / Demo Mode when keys are not configured yet
        mock_order_id = f"order_mock_{plan_id}_{int(time.time())}"
        return Response({
            'status': 'success',
            'order_id': mock_order_id,
            'amount': amount_in_subunits,
            'currency': currency,
            'key_id': key_id or 'rzp_test_placeholder',
            'mock': True,
            'message': 'Razorpay keys not configured in backend .env (running in simulation mode).'
        }, status=status.HTTP_200_OK)


class VerifyPaymentView(APIView):
    """
    POST /api/payments/verify/
    Body: {
        "razorpay_order_id": "...",
        "razorpay_payment_id": "...",
        "razorpay_signature": "...",
        "plan_id": "...",
        "plan_name": "...",
        "price": "...",
        "currency": "..."
    }
    """

    def post(self, request):
        order_id = request.data.get('razorpay_order_id', '')
        payment_id = request.data.get('razorpay_payment_id', '')
        signature = request.data.get('razorpay_signature', '')
        plan_id = request.data.get('plan_id', 'monthly')
        plan_name = request.data.get('plan_name', 'Monthly Pro')
        price = request.data.get('price', '')
        currency = request.data.get('currency', 'INR')

        client, key_id, key_secret = get_razorpay_client()

        # If real keys were used and not a mock order, verify HMAC signature
        if client and key_secret and not order_id.startswith('order_mock_'):
            try:
                # Razorpay verification utility
                client.utility.verify_payment_signature({
                    'razorpay_order_id': order_id,
                    'razorpay_payment_id': payment_id,
                    'razorpay_signature': signature
                })
            except Exception as e:
                # Verification failed
                return Response({
                    'status': 'error',
                    'message': 'Invalid payment signature. Payment verification failed.'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Calculate subscription expiration date
        now = datetime.utcnow()
        if plan_id == 'monthly':
            expires_at = (now + timedelta(days=30)).isoformat() + 'Z'
        elif plan_id == 'yearly':
            expires_at = (now + timedelta(days=365)).isoformat() + 'Z'
        else:
            expires_at = 'Lifetime'

        subscription = {
            'planId': plan_id,
            'name': plan_name,
            'price': price,
            'currency': currency,
            'status': 'active',
            'paymentId': payment_id,
            'orderId': order_id,
            'startedAt': now.isoformat() + 'Z',
            'expiresAt': expires_at,
            'isLifetime': plan_id == 'lifetime',
        }

        return Response({
            'status': 'success',
            'message': 'Payment verified and subscription activated successfully!',
            'subscription': subscription
        }, status=status.HTTP_200_OK)
