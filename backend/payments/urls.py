from django.urls import path
from .views import CreateOrderView, VerifyPaymentView

urlpatterns = [
    path('create-order/', CreateOrderView.as_view(), name='payment-create-order'),
    path('verify/', VerifyPaymentView.as_view(), name='payment-verify'),
]
