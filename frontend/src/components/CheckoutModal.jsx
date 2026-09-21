import { useState } from 'react'
import {
  FiX,
  FiLock,
  FiShield,
  FiTag,
  FiZap,
  FiAward,
  FiCheckCircle,
  FiAlertCircle,
  FiCheck,
  FiCreditCard,
  FiSmartphone
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import './CheckoutModal.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-recipe-2wpn.vercel.app'
const API_BASE = `${API_URL.replace(/\/+$/, '')}/api/payments`

export default function CheckoutModal({ plan, currency, onClose, onSuccess }) {
  const { user, subscribePlan } = useAuth()
  const [promoCode, setPromoCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!plan) return null

  // Apply Promo Coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault()
    setCouponError('')
    setCouponSuccess('')
    const code = promoCode.trim().toUpperCase()

    if (!code) return

    if (code === 'CHEF20' || code === 'MASTERCHEF') {
      setAppliedDiscount(20)
      setCouponSuccess('20% discount coupon applied!')
    } else if (code === 'WELCOME10' || code === 'SAVE10') {
      setAppliedDiscount(10)
      setCouponSuccess('10% discount coupon applied!')
    } else if (code === 'VIP50' && plan.id === 'lifetime') {
      setAppliedDiscount(25)
      setCouponSuccess('25% VIP lifetime discount applied!')
    } else {
      setCouponError('Invalid or expired coupon code. Try CHEF20')
    }
  }

  const basePriceNum = parseFloat(plan.priceRaw[currency])
  const discountAmount = appliedDiscount > 0 ? (basePriceNum * (appliedDiscount / 100)) : 0
  const finalPriceNum = Math.max(0, basePriceNum - discountAmount)
  const currencySymbol = currency === 'INR' ? '₹' : '$'
  const finalPriceFormatted = `${currencySymbol}${finalPriceNum.toFixed(currency === 'INR' ? 0 : 2)}`

  // Complete & Activate Subscription only after genuine verification
  const finalizeSubscription = (paymentDetails = {}) => {
    const sub = subscribePlan({
      planId: plan.id,
      name: plan.name,
      price: finalPriceFormatted,
      currency: currency,
      billingPeriod: plan.periodLabel,
      paymentId: paymentDetails.paymentId,
      orderId: paymentDetails.orderId,
    })

    setProcessing(false)
    setIsSuccess(true)

    setTimeout(() => {
      if (onSuccess) onSuccess(sub)
      onClose()
    }, 2000)
  }

  // Real Razorpay Payment Execution
  const handleProceedToPayment = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setErrorMessage('')

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID

    // Check if Razorpay Key is provided
    if (!razorpayKey || razorpayKey.trim() === '') {
      setProcessing(false)
      setErrorMessage(
        'Razorpay Key ID is not configured. Please add VITE_RAZORPAY_KEY_ID in your frontend/.env file and Razorpay keys in backend/.env to accept real payments.'
      )
      return
    }

    if (!window.Razorpay) {
      setProcessing(false)
      setErrorMessage('Razorpay payment gateway is loading. Please check your internet connection and try again.')
      return
    }

    try {
      // 1. Request secure order creation from backend
      let orderData = null
      const orderRes = await fetch(`${API_BASE}/create-order/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: plan.id,
          plan_name: plan.name,
          amount: finalPriceNum,
          currency: currency,
        }),
      })

      if (orderRes.ok) {
        orderData = await orderRes.json()
      } else {
        const errJson = await orderRes.json().catch(() => ({}))
        throw new Error(errJson.message || 'Failed to create payment order on server.')
      }

      const activeKey = orderData?.key_id && orderData.key_id !== 'rzp_test_placeholder'
        ? orderData.key_id
        : razorpayKey

      // 2. Open Official Razorpay Payment Gateway
      const options = {
        key: activeKey,
        amount: orderData?.amount || Math.round(finalPriceNum * 100),
        currency: currency,
        name: 'RecipeAI Pro',
        description: `${plan.name} Subscription (${plan.periodLabel})`,
        image: '/favicon.svg',
        order_id: orderData?.order_id && !orderData.order_id.startsWith('order_mock_') ? orderData.order_id : undefined,
        handler: async function (response) {
          // 3. Verify Payment Signature with backend
          try {
            const verifyRes = await fetch(`${API_BASE}/verify/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderData?.order_id || '',
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || '',
                plan_id: plan.id,
                plan_name: plan.name,
                price: finalPriceFormatted,
                currency: currency,
              }),
            })

            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) {
              throw new Error(verifyData.message || 'Payment signature verification failed.')
            }

            // Subscription confirmed
            finalizeSubscription({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            })
          } catch (vErr) {
            setProcessing(false)
            setErrorMessage(vErr.message || 'Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: '',
        },
        notes: {
          plan_id: plan.id,
          plan_name: plan.name,
          user_id: user?.id || 'guest',
        },
        theme: {
          color: '#00cba3',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (resp) {
        setProcessing(false)
        setErrorMessage(resp.error?.description || 'Payment was declined or failed by bank.')
      })
      rzp.open()
    } catch (error) {
      setProcessing(false)
      setErrorMessage(error.message || 'Payment initiation failed. Please try again.')
    }
  }

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div
        className="checkout-modal glass-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button className="checkout-close-btn" onClick={onClose} aria-label="Close modal">
          <FiX size={20} />
        </button>

        {isSuccess ? (
          <div className="checkout-success animate-fade-in">
            <div className="checkout-success__icon-wrap">
              <FiCheckCircle size={64} className="checkout-success__icon" />
              <div className="checkout-success__glow" />
            </div>
            <h2 className="checkout-success__title">Subscription Activated!</h2>
            <p className="checkout-success__desc">
              Welcome to <strong>{plan.name}</strong>! You now have unlimited culinary intelligence and full pro privileges.
            </p>
            <div className="checkout-success__badge">
              <FiAward size={16} /> Premium Chef Status: Active
            </div>
          </div>
        ) : (
          <div className="checkout-body">
            {/* Header */}
            <div className="checkout-header">
              <div className="checkout-badge-wrap">
                <span className="checkout-plan-tag">{plan.emoji} {plan.name}</span>
                {plan.badge && <span className="checkout-ribbon">{plan.badge}</span>}
              </div>
              <h2 className="checkout-title">Complete Your Subscription</h2>
              <p className="checkout-sub">Unlock unlimited AI recipes, custom meal plans, and culinary superpowers.</p>
            </div>

            {errorMessage && (
              <div
                className="checkout-error-banner animate-fade-in"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '18px',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <FiAlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Content Columns */}
            <div className="checkout-grid">
              {/* Order Summary & Perks */}
              <div className="checkout-summary-col">
                <div className="checkout-card-box">
                  <h3 className="checkout-section-title">Order Summary</h3>

                  <div className="checkout-plan-row">
                    <div>
                      <div className="checkout-plan-title">{plan.name}</div>
                      <div className="checkout-plan-duration">{plan.periodLabel}</div>
                    </div>
                    <div className="checkout-plan-amount">
                      {plan.originalPrice && (
                        <span className="checkout-old-price">
                          {currencySymbol}{plan.originalPrice[currency]}
                        </span>
                      )}
                      <span>{currencySymbol}{plan.priceRaw[currency]}</span>
                    </div>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="checkout-discount-row">
                      <span>Promo Discount ({appliedDiscount}%)</span>
                      <span className="checkout-discount-amount">
                        -{currencySymbol}{discountAmount.toFixed(currency === 'INR' ? 0 : 2)}
                      </span>
                    </div>
                  )}

                  <div className="checkout-divider" />

                  <div className="checkout-total-row">
                    <span>Total Due Today</span>
                    <span className="checkout-total-amount">{finalPriceFormatted}</span>
                  </div>

                  {/* Promo Code Form */}
                  <form className="checkout-coupon-form" onSubmit={handleApplyCoupon}>
                    <div className="checkout-coupon-input-wrap">
                      <FiTag className="checkout-coupon-icon" size={15} />
                      <input
                        type="text"
                        placeholder="Promo code (e.g. CHEF20)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="checkout-coupon-input"
                      />
                      <button type="submit" className="btn btn-ghost btn-sm checkout-coupon-btn">
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="coupon-msg coupon-msg--error">{couponError}</p>}
                    {couponSuccess && <p className="coupon-msg coupon-msg--success">{couponSuccess}</p>}
                  </form>
                </div>

                {/* Plan Highlights */}
                <div className="checkout-perks-box">
                  <div className="checkout-perks-title">
                    <FiAward size={16} style={{ color: 'var(--secondary)' }} /> Included with this plan:
                  </div>
                  <ul className="checkout-perks-list">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i}>
                        <FiCheck size={14} className="checkout-check-icon" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Secure Payment Column */}
              <div className="checkout-payment-col">
                <h3 className="checkout-section-title">Payment Gateway</h3>

                <div
                  className="payment-fields"
                  style={{
                    padding: '20px',
                    background: 'rgba(0, 203, 163, 0.05)',
                    borderRadius: '14px',
                    border: '1px solid rgba(0, 203, 163, 0.25)',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(0, 203, 163, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--secondary)'
                    }}>
                      <FiZap size={22} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block' }}>
                        Razorpay Secure Checkout
                      </strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Official Bank-Grade Payment Processing
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    marginBottom: '14px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <FiSmartphone size={16} style={{ color: '#00cba3' }} />
                      <span>UPI / QR / GPay / Paytm</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <FiCreditCard size={16} style={{ color: '#38bdf8' }} />
                      <span>Debit & Credit Cards</span>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Clicking below will open the official Razorpay gateway window to securely complete your payment with full bank authentication (OTP / UPI PIN).
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={processing}
                  className="btn btn-primary btn-lg checkout-submit-btn"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {processing ? (
                    <span className="checkout-btn-loading">
                      <span className="spinner-dots" /> Connecting Gateway...
                    </span>
                  ) : (
                    <>
                      <FiLock size={18} /> Pay {finalPriceFormatted} via Razorpay
                    </>
                  )}
                </button>

                <div className="checkout-trust-footer" style={{ marginTop: '16px' }}>
                  <div className="trust-item">
                    <FiLock size={13} /> 256-Bit SSL Encrypted
                  </div>
                  <div className="trust-item">
                    <FiShield size={13} /> 14-Day Money Back Guarantee
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
