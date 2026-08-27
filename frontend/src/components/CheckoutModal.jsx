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
  FiSmartphone
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import './CheckoutModal.css'

export default function CheckoutModal({ plan, currency, onClose, onSuccess }) {
  const { user, subscribePlan } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('card') // 'card' | 'upi' | 'paypal' | 'applepay'
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

  // Submit Payment
  const handleCheckoutSubmit = (e) => {
    e.preventDefault()
    setProcessing(true)

    setTimeout(() => {
      // Complete subscription
      const sub = subscribePlan({
        planId: plan.id,
        name: plan.name,
        price: finalPriceFormatted,
        currency: currency,
        billingPeriod: plan.periodLabel,
      })

      setProcessing(false)
      setIsSuccess(true)

      setTimeout(() => {
        if (onSuccess) onSuccess(sub)
        onClose()
      }, 1600)
    }, 1200)
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
                    className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <FiCreditCard size={17} />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    className={`method-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <FiSmartphone size={17} />
                    <span>UPI / GPay</span>
                  </button>
                  <button
                    type="button"
                    className={`method-tab ${paymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <span>🅿️ PayPal</span>
                  </button>
                  <button
                    type="button"
                    className={`method-tab ${paymentMethod === 'applepay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('applepay')}
                  >
                    <span>🍏 Apple Pay</span>
                  </button>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="checkout-form">
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

                  {paymentMethod === 'paypal' && (
                    <div className="payment-fields paypal-box animate-fade-in">
                      <p>You will be redirected securely to PayPal to confirm your subscription.</p>
                      <div className="paypal-preview-btn">
                        <span>PayPal Express Checkout</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'applepay' && (
                    <div className="payment-fields applepay-box animate-fade-in">
                      <p>Authorize payment seamlessly with Touch ID or Face ID on Apple Pay.</p>
                      <div className="applepay-preview-btn">
                        <span>🍏 Pay with Apple Pay</span>
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
