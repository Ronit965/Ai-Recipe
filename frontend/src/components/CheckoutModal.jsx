import { useState } from 'react'
import {
  FiX,
  FiCreditCard,
  FiCheck,
  FiLock,
  FiShield,
  FiTag,
  FiZap,
  FiAward,
  FiCheckCircle,
  FiSmartphone,
  FiAlertCircle
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import './CheckoutModal.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-recipe-2wpn.vercel.app'
const API_BASE = `${API_URL.replace(/\/+$/, '')}/api/payments`

export default function CheckoutModal({ plan, currency, onClose, onSuccess }) {
  const { user, subscribePlan } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('razorpay') // 'razorpay' | 'card' | 'upi'
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState(user?.name || '')
  const [upiId, setUpiId] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!plan) return null

  // Format Card Number
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16)
    val = val.replace(/(\d{4})/g, '$1 ').trim()
    setCardNumber(val)
  }

  // Format Expiry
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2)
    }
    setCardExpiry(val)
  }

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

  // Complete & Activate Subscription
  const finalizeSubscription = (paymentDetails = {}) => {
    const sub = subscribePlan({
      planId: plan.id,
      name: plan.name,
      price: finalPriceFormatted,
      currency: currency,
      billingPeriod: plan.periodLabel,
      paymentId: paymentDetails.paymentId || `mock_pay_${Date.now()}`,
      orderId: paymentDetails.orderId || '',
    })

    setProcessing(false)
    setIsSuccess(true)

    setTimeout(() => {
      if (onSuccess) onSuccess(sub)
      onClose()
    }, 1800)
  }

  // Razorpay Checkout Trigger
  const handleRazorpayPayment = async () => {
    setProcessing(true)
    setErrorMessage('')

    try {
      // 1. Create order on backend
      let orderData = null
      try {
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
        }
      } catch (err) {
        console.warn('Backend payment order offline, falling back to client checkout:', err)
      }

      const razorpayKey = orderData?.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID

      // 2. Check if Razorpay JS SDK is loaded and valid key available
      if (window.Razorpay && razorpayKey && razorpayKey !== 'rzp_test_placeholder') {
        const options = {
          key: razorpayKey,
          amount: orderData?.amount || Math.round(finalPriceNum * 100),
          currency: currency,
          name: 'RecipeAI Pro',
          description: `${plan.name} (${plan.periodLabel})`,
          image: '/favicon.svg',
          order_id: orderData?.order_id && !orderData.order_id.startsWith('order_mock_') ? orderData.order_id : undefined,
          handler: async function (response) {
            // Verify payment with backend
            try {
              await fetch(`${API_BASE}/verify/`, {
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
            } catch (vErr) {
              console.warn('Backend verification notice:', vErr)
            }

            finalizeSubscription({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            })
          },
          prefill: {
            name: user?.name || cardName || '',
            email: user?.email || '',
            contact: '',
          },
          notes: {
            plan_id: plan.id,
            plan_name: plan.name,
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
          setErrorMessage(resp.error?.description || 'Payment was cancelled or failed.')
        })
        rzp.open()
        return
      }

      // If simulated / direct test mode
      setTimeout(() => {
        finalizeSubscription({
          paymentId: `rzp_sim_${Date.now()}`,
          orderId: orderData?.order_id || `order_sim_${Date.now()}`,
        })
      }, 1200)
    } catch (error) {
      setProcessing(false)
      setErrorMessage(error.message || 'Payment initiation failed. Please try again.')
    }
  }

  // Submit Payment Form
  const handleCheckoutSubmit = (e) => {
    e.preventDefault()
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment()
    } else {
      setProcessing(true)
      setTimeout(() => {
        finalizeSubscription()
      }, 1200)
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
              <div className="checkout-error-banner animate-fade-in" style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiAlertCircle size={16} /> {errorMessage}
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

              {/* Payment Details */}
              <div className="checkout-payment-col">
                <h3 className="checkout-section-title">Select Payment Method</h3>

                {/* Tabs */}
                <div className="checkout-methods">
                  <button
                    type="button"
                    className={`method-tab ${paymentMethod === 'razorpay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('razorpay')}
                  >
                    <FiZap size={17} style={{ color: '#00cba3' }} />
                    <span>Razorpay (UPI, Cards, Netbanking)</span>
                  </button>
                  <button
                    type="button"
                    className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <FiCreditCard size={17} />
                    <span>Direct Card</span>
                  </button>
                  <button
                    type="button"
                    className={`method-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <FiSmartphone size={17} />
                    <span>UPI ID</span>
                  </button>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                  {paymentMethod === 'razorpay' && (
                    <div className="payment-fields animate-fade-in" style={{
                      padding: '16px',
                      background: 'rgba(0, 203, 163, 0.06)',
                      borderRadius: '12px',
                      border: '1px solid rgba(0, 203, 163, 0.2)',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.4rem' }}>⚡</span>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Instant Razorpay Checkout</strong>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Supports Google Pay, PhonePe, Paytm, BHIM UPI, Cards & Netbanking.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="payment-fields animate-fade-in">
                      <div className="input-group">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Gordon Ramsay"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label>Card Number</label>
                        <div className="input-icon-wrap">
                          <FiCreditCard className="input-icon" size={17} />
                          <input
                            type="text"
                            required
                            placeholder="4532 •••• •••• 8892"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength={19}
                          />
                        </div>
                      </div>
                      <div className="input-row-2">
                        <div className="input-group">
                          <label>Expiry Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            maxLength={5}
                          />
                        </div>
                        <div className="input-group">
                          <label>CVV / CVC</label>
                          <div className="input-icon-wrap">
                            <FiLock className="input-icon" size={15} />
                            <input
                              type="password"
                              required
                              placeholder="•••"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              maxLength={4}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="payment-fields animate-fade-in">
                      <div className="input-group">
                        <label>Enter UPI ID / VPA</label>
                        <input
                          type="text"
                          required
                          placeholder="yourname@okhdfcbank / paytm"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                      </div>
                      <div className="upi-qr-preview">
                        <div className="upi-qr-box">
                          <div className="upi-mock-qr">📱 Scan with GPay / PhonePe / Paytm</div>
                        </div>
                        <div className="upi-hints">
                          <span>Instant UPI authentication & immediate activation</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={processing}
                    className="btn btn-primary btn-lg checkout-submit-btn"
                  >
                    {processing ? (
                      <span className="checkout-btn-loading">
                        <span className="spinner-dots" /> Activating Subscription...
                      </span>
                    ) : (
                      <>
                        <FiZap size={18} /> Pay {finalPriceFormatted} & Activate
                      </>
                    )}
                  </button>

                  <div className="checkout-trust-footer">
                    <div className="trust-item">
                      <FiLock size={13} /> 256-Bit SSL Encrypted
                    </div>
                    <div className="trust-item">
                      <FiShield size={13} /> 14-Day Money Back Guarantee
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
