import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiCheck,
  FiZap,
  FiStar,
  FiShield,
  FiLock,
  FiRefreshCw,
  FiHelpCircle,
  FiAward,
  FiChevronDown,
  FiChevronUp,
  FiArrowRight
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useScrollReveal, useMagneticButtons } from '../hooks/useAnimations'
import CheckoutModal from '../components/CheckoutModal'
import './SubscriptionPage.css'

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Pro',
    emoji: '🍳',
    tagline: 'Flexible culinary intelligence',
    description: 'Perfect for curious home cooks who want daily AI recipe inspiration with total month-to-month freedom.',
    priceRaw: { USD: '3', INR: '300' },
    originalPrice: null,
    periodLabel: 'per month',
    billingCycleText: 'Billed monthly. Cancel anytime.',
    badge: null,
    popular: false,
    color: '#00cba3',
    features: [
      'Unlimited AI recipe generations',
      '120+ International cuisines & fusion styles',
      'Smart dietary & allergy filter engine',
      'Full macro & calorie nutrition analysis',
      'Save up to 100 recipes in your cookbook',
      'Hindi & English recipe translations',
      'Standard AI generation speed',
      'Email support',
    ],
    ctaText: 'Get Started Monthly',
  },
  {
    id: 'yearly',
    name: 'Annual Master Chef',
    emoji: '👨‍🍳',
    tagline: 'Best value for everyday cooks',
    description: 'Our most loved plan for foodies, families, and meal preppers who want maximum savings and premium AI features.',
    priceRaw: { USD: '30', INR: '3000' },
    originalPrice: { USD: '36', INR: '3600' },
    periodLabel: 'per year',
    monthlyEquivalent: { USD: '$2.50/mo', INR: '₹250/mo' },
    billingCycleText: 'Billed annually ($2.50/mo or ₹250/mo). 2 months free!',
    badge: '🔥 MOST POPULAR • 2 MONTHS FREE',
    popular: true,
    color: '#f59e0b',
    features: [
      'Everything in Monthly Pro, plus:',
      '⚡ Ultra-fast priority AI processing',
      'Unlimited saved recipes & custom cookbooks',
      'Smart weekly meal planner & grocery lists',
      'Export recipes to high-res printable PDF',
      'Pantry & fridge ingredients scanner',
      'Multi-device access (up to 2 devices)',
      'Priority customer & culinary support',
    ],
    ctaText: 'Upgrade to Annual (Save 17%)',
  },
  {
    id: 'lifetime',
    name: 'Lifetime Gourmet VIP',
    emoji: '👑',
    tagline: 'Pay once, cook forever',
    description: 'The ultimate culinary pass. One single payment grants you and your family permanent VIP access with all future upgrades included.',
    priceRaw: { USD: '300', INR: '30000' },
    originalPrice: { USD: '500', INR: '50000' },
    periodLabel: 'one-time payment',
    billingCycleText: 'Pay once. Zero recurring fees forever.',
    badge: '👑 VIP LIFETIME PASS',
    popular: false,
    color: '#8b5cf6',
    features: [
      'Everything in Annual Master Chef, plus:',
      '♾️ Permanent lifetime access — zero renewals',
      'All future AI model upgrades (GPT-5 & Next-Gen)',
      'Family sharing (up to 5 profiles / devices)',
      'Commercial recipe rights & menu creator',
      '1-on-1 AI culinary prompt tuning & assistant',
      'Early access to all upcoming features',
      '24/7 Dedicated VIP concierge support',
    ],
    ctaText: 'Claim Lifetime Access',
  },
]

const COMPARISON_FEATURES = [
  { name: 'Recipe Generations', free: '5 / day', monthly: 'Unlimited', yearly: 'Unlimited', lifetime: 'Unlimited' },
  { name: 'AI Response Speed', free: 'Standard', monthly: 'Fast', yearly: '⚡ Turbo Priority', lifetime: '⚡ VIP Lightning' },
  { name: 'Saved Recipe Limit', free: '5 recipes', monthly: '100 recipes', yearly: '♾️ Unlimited', lifetime: '♾️ Unlimited' },
  { name: 'Dietary & Allergy Engine', free: 'Basic (3)', monthly: '20+ Cuisines', yearly: '20+ Cuisines', lifetime: '20+ Cuisines' },
  { name: 'Nutritional Breakdown', free: 'Calories only', monthly: 'Full Macros', yearly: 'Full Macros + Export', lifetime: 'Full Macros + Export' },
  { name: 'Hindi Translation', free: '❌', monthly: '✅ Included', yearly: '✅ Included', lifetime: '✅ Included' },
  { name: 'Weekly Meal Planner', free: '❌', monthly: '❌', yearly: '✅ Included', lifetime: '✅ Included' },
  { name: 'Printable PDF Cookbook Export', free: '❌', monthly: '❌', yearly: '✅ Included', lifetime: '✅ Included' },
  { name: 'Fridge & Pantry Scanner', free: '❌', monthly: '❌', yearly: '✅ Included', lifetime: '✅ Included' },
  { name: 'Family / Multi-Device Access', free: '1 device', monthly: '1 device', yearly: '2 devices', lifetime: '5 devices' },
  { name: 'Future AI Model Upgrades', free: '❌', monthly: 'While active', yearly: 'While active', lifetime: '♾️ Forever Included' },
  { name: 'Customer Support', free: 'Community', monthly: 'Standard Email', yearly: 'Priority Email', lifetime: '24/7 VIP Concierge' },
]

const FAQS = [
  {
    q: 'How does the subscription work?',
    a: 'Once you choose a subscription plan, you get immediate access to all premium features including unlimited recipe generations, custom dietary adaptations, nutritional breakdowns, and cookbook storage. Monthly and annual plans renew automatically until cancelled, while the Lifetime plan is a single one-time payment with no recurring charges.'
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes, absolutely! You can cancel your subscription at any time with a single click from your profile settings or by contacting our team. If you cancel, you will continue to enjoy your Pro benefits until the end of your current billing period.'
  },
  {
    q: 'What is the Lifetime VIP pass?',
    a: 'The Lifetime VIP pass is a one-time purchase that gives you permanent access to RecipeAI Pro forever. You will never be billed again, and you will automatically receive all future AI models, new features, and culinary tools at no additional cost.'
  },
  {
    q: 'Is there a money-back guarantee?',
    a: 'Yes! We offer a 100% risk-free 14-day money-back guarantee on all our plans. If you are not completely delighted with your cooking experience, simply reach out to support@recipeai.app within 14 days for a full refund.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), UPI (Google Pay, PhonePe, Paytm), PayPal, and Apple Pay. All transactions are securely encrypted with 256-bit SSL protection.'
  },
  {
    q: 'Can I switch between monthly and annual plans?',
    a: 'Yes! You can upgrade from monthly to annual or lifetime at any time, and any remaining balance on your existing plan will be automatically credited towards your upgrade.'
  }
]

const TESTIMONIALS = [
  {
    name: 'Chef Marcus Vance',
    role: 'Executive Chef & Food Stylist',
    avatar: '👨‍🍳',
    text: 'RecipeAI has transformed how I brainstorm new tasting menus. The precision in flavor pairing and ingredient substitutions is mind-blowing. The Lifetime VIP pass paid for itself in week one!',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Nutritionist & Home Cook',
    avatar: '👩‍⚕️',
    text: 'As a nutritionist, having precise macro breakdowns and diabetic-friendly customization at my fingertips is invaluable. My whole family uses the annual plan daily for healthy meal prep.',
    rating: 5,
  },
  {
    name: 'Elena Rostova',
    role: 'Busy Mother of 3',
    avatar: '👩‍👧‍👦',
    text: 'We went from ordering takeout 4 nights a week to cooking exciting, 20-minute dinners together. The Hindi translation and ingredient scanner saved our pantry budget!',
    rating: 5,
  },
]

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [currency, setCurrency] = useState('USD') // 'USD' | 'INR'
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  useScrollReveal()
  useMagneticButtons()

  const currentPlanId = user?.subscription?.status === 'active' ? user.subscription.planId : null

  const handlePlanClick = (plan) => {
    setSelectedPlan(plan)
  }

  const toggleFaq = (idx) => {
    setOpenFaqIndex(prev => (prev === idx ? -1 : idx))
  }

  return (
    <div className="sub-page">
      {/* ── HERO ── */}
      <section className="sub-hero">
        <div className="sub-hero__glow-1" />
        <div className="sub-hero__glow-2" />
        <div className="container sub-hero__content">
          <div className="sub-hero__badge animate-fade-in-down">
            <FiAward size={15} /> Simple, Transparent Pricing
          </div>
          <h1 className="sub-hero__title animate-fade-in-up delay-100">
            Elevate Your Cooking with <span className="gradient-text">Pro AI Intelligence</span>
          </h1>
          <p className="sub-hero__subtitle animate-fade-in-up delay-200">
            Join over 12,000 home chefs creating delicious, personalized recipes with unlimited AI generations,
            smart nutrition tracking, and weekly meal prep assistance.
          </p>

          {/* Active Subscription Alert */}
          {user?.subscription?.status === 'active' && (
            <div className="sub-active-banner animate-fade-in delay-250">
              <span className="sub-active-badge">
                <FiAward size={16} /> Active Plan: {user.subscription.name}
              </span>
              <span className="sub-active-meta">
                {user.subscription.isLifetime
                  ? 'Forever VIP Access'
                  : `Renews on ${new Date(user.subscription.expiresAt).toLocaleDateString()}`}
              </span>
            </div>
          )}

          {/* Currency Toggle */}
          <div className="sub-currency-toggle animate-fade-in-up delay-300">
            <span className="sub-currency-label">Currency:</span>
            <div className="sub-currency-pills">
              <button
                className={`currency-pill ${currency === 'USD' ? 'active' : ''}`}
                onClick={() => setCurrency('USD')}
              >
                💵 USD ($)
              </button>
              <button
                className={`currency-pill ${currency === 'INR' ? 'active' : ''}`}
                onClick={() => setCurrency('INR')}
              >
                🇮🇳 INR (₹)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="section sub-cards-section">
        <div className="container">
          <div className="sub-cards-grid">
            {PLANS.map((plan, i) => {
              const isCurrent = currentPlanId === plan.id
              const currencySymbol = currency === 'INR' ? '₹' : '$'
              const price = plan.priceRaw[currency]
              const origPrice = plan.originalPrice ? plan.originalPrice[currency] : null

              return (
                <div
                  key={plan.id}
                  className={`sub-card glass-card ${plan.popular ? 'sub-card--popular' : ''} ${isCurrent ? 'sub-card--current' : ''}`}
                  data-reveal="up"
                  data-reveal-delay={i * 120}
                >
                  {plan.badge && (
                    <div className="sub-card__badge">
                      {plan.badge}
                    </div>
                  )}

                  <div className="sub-card__header">
                    <div className="sub-card__icon-wrap" style={{ borderColor: plan.color }}>
                      <span className="sub-card__emoji">{plan.emoji}</span>
                    </div>
                    <h3 className="sub-card__title">{plan.name}</h3>
                    <p className="sub-card__tagline">{plan.tagline}</p>
                  </div>

                  <div className="sub-card__pricing">
                    <div className="sub-card__price-row">
                      {origPrice && (
                        <span className="sub-card__orig-price">
                          {currencySymbol}{origPrice}
                        </span>
                      )}
                      <span className="sub-card__amount">
                        {currencySymbol}{price}
                      </span>
                      <span className="sub-card__period">/ {plan.periodLabel}</span>
                    </div>
                    <p className="sub-card__billing-text">{plan.billingCycleText}</p>
                  </div>

                  <div className="sub-card__divider" />

                  {/* Feature Checklist */}
                  <ul className="sub-card__features">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="sub-card__feature-item">
                        <span className="sub-card__check" style={{ color: plan.color }}>
                          <FiCheck size={16} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="sub-card__cta">
                    {isCurrent ? (
                      <button className="btn btn-ghost sub-btn--active" disabled>
                        <FiCheck size={16} /> Current Active Plan
                      </button>
                    ) : (
                      <button
                        className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-lg sub-btn`}
                        onClick={() => handlePlanClick(plan)}
                      >
                        <FiZap size={18} /> {plan.ctaText}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Trust Highlights */}
          <div className="sub-trust-banner glass-card" data-reveal="zoom">
            <div className="sub-trust-item">
              <FiShield className="sub-trust-icon" size={24} />
              <div>
                <h4>14-Day Money Back Guarantee</h4>
                <p>Try completely risk-free. If not satisfied, 100% refund.</p>
              </div>
            </div>
            <div className="sub-trust-divider" />
            <div className="sub-trust-item">
              <FiRefreshCw className="sub-trust-icon" size={24} />
              <div>
                <h4>Cancel or Switch Anytime</h4>
                <p>No lock-in contracts. Instant online cancellation.</p>
              </div>
            </div>
            <div className="sub-trust-divider" />
            <div className="sub-trust-item">
              <FiLock className="sub-trust-icon" size={24} />
              <div>
                <h4>256-Bit SSL Encrypted</h4>
                <p>Your payment data is guarded with bank-level security.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON MATRIX ── */}
      <section className="section sub-comparison-section">
        <div className="container">
          <div className="section-header" data-reveal="up">
            <span className="section-label">Feature Matrix</span>
            <h2 className="section-title">Compare All <span>Plan Perks</span></h2>
            <p className="section-desc">See exactly what is included in each subscription tier.</p>
          </div>

          <div className="sub-table-wrap glass-card" data-reveal="up">
            <table className="sub-table">
              <thead>
                <tr>
                  <th className="th-feature">Feature / Perk</th>
                  <th className="th-starter">Free Starter</th>
                  <th className="th-monthly">Monthly Pro</th>
                  <th className="th-yearly th-highlight">Annual Chef ⭐</th>
                  <th className="th-lifetime">Lifetime VIP 👑</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, idx) => (
                  <tr key={idx}>
                    <td className="td-feature-name">{row.name}</td>
                    <td className="td-starter">{row.free}</td>
                    <td className="td-monthly">{row.monthly}</td>
                    <td className="td-yearly td-highlight">{row.yearly}</td>
                    <td className="td-lifetime">{row.lifetime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section sub-reviews-section">
        <div className="container">
          <div className="section-header" data-reveal="up">
            <span className="section-label">Cook Community</span>
            <h2 className="section-title">Loved by <span>12,000+ Foodies</span></h2>
            <p className="section-desc">Here is what culinary enthusiasts say about RecipeAI Pro.</p>
          </div>

          <div className="sub-reviews-grid">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="sub-review-card glass-card" data-reveal="up" data-reveal-delay={idx * 120}>
                <div className="sub-review-stars">
                  {[...Array(t.rating)].map((_, i) => (
                    <FiStar key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className="sub-review-text">"{t.text}"</p>
                <div className="sub-review-user">
                  <span className="sub-review-avatar">{t.avatar}</span>
                  <div>
                    <div className="sub-review-name">{t.name}</div>
                    <div className="sub-review-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section className="section sub-faq-section">
        <div className="container">
          <div className="section-header" data-reveal="up">
            <span className="section-label">Have Questions?</span>
            <h2 className="section-title">Frequently Asked <span>Questions</span></h2>
            <p className="section-desc">Everything you need to know about our subscriptions and billing.</p>
          </div>

          <div className="sub-faq-list">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={idx}
                  className={`sub-faq-item glass-card ${isOpen ? 'sub-faq-item--open' : ''}`}
                  onClick={() => toggleFaq(idx)}
                >
                  <div className="sub-faq-q">
                    <span className="sub-faq-q-text">
                      <FiHelpCircle size={18} className="sub-faq-icon" /> {faq.q}
                    </span>
                    <span className="sub-faq-toggle">
                      {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </span>
                  </div>
                  {isOpen && (
                    <div className="sub-faq-a animate-fade-in">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="section sub-bottom-cta">
        <div className="container">
          <div className="sub-cta-banner glass-card" data-reveal="zoom">
            <div className="sub-cta-content">
              <span className="section-label">Start Cooking Today</span>
              <h2 className="sub-cta-title">
                Ready to unleash your inner <span className="gradient-text">Master Chef</span>?
              </h2>
              <p className="sub-cta-desc">
                Choose the plan that suits you best and turn everyday ingredients into unforgettable meals.
              </p>
              <div className="sub-cta-btns">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setSelectedPlan(PLANS[1])}
                >
                  <FiZap size={18} /> Get Annual Master Chef
                </button>
                <Link to="/generator" className="btn btn-ghost btn-lg">
                  Try Generator Free <FiArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHECKOUT MODAL ── */}
      {selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          currency={currency}
          onClose={() => setSelectedPlan(null)}
          onSuccess={(sub) => {
            console.log('Subscribed successfully:', sub)
          }}
        />
      )}
    </div>
  )
}
