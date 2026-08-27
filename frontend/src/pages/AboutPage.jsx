import { Link } from 'react-router-dom'
import { FiZap, FiArrowRight, FiCheck, FiStar, FiShield, FiHeart, FiGlobe, FiCpu, FiClock, FiTrendingUp } from 'react-icons/fi'
import { useScrollReveal, useMagneticButtons } from '../hooks/useAnimations'
import './AboutPage.css'

const WHY_CHOOSE_US = [
  {
    icon: <FiCpu size={28} />,
    emoji: '🤖',
    title: 'Cutting-Edge AI',
    desc: 'Powered by state-of-the-art language models that understand culinary science, flavor pairing, and nutrition — giving you recipes a professional chef would be proud of.',
    color: '#00cba3',
    perks: ['GPT-powered recipe generation', 'Context-aware suggestions', 'Real-time personalization'],
  },
  {
    icon: <FiClock size={28} />,
    emoji: '⚡',
    title: 'Instant Results',
    desc: 'From idea to plated dish in seconds. No more endless scrolling through food blogs. Type your ingredients and get a complete, step-by-step recipe immediately.',
    color: '#f59e0b',
    perks: ['Sub-second generation', 'Complete instructions', 'No signup required'],
  },
  {
    icon: <FiGlobe size={28} />,
    emoji: '🌍',
    title: '120+ World Cuisines',
    desc: 'From the streets of Bangkok to the bistros of Paris — our AI has mastered over 120 global cuisines and can blend them into exciting fusion dishes unique to your taste.',
    color: '#8b5cf6',
    perks: ['Italian, Thai, Indian & more', 'Authentic regional recipes', 'Fusion cuisine support'],
  },
  {
    icon: <FiShield size={28} />,
    emoji: '🥗',
    title: 'Dietary Intelligence',
    desc: 'Vegan, keto, gluten-free, diabetic-friendly — our AI respects your dietary restrictions and health goals without sacrificing taste or creativity.',
    color: '#10b981',
    perks: ['20+ dietary filters', 'Allergy-safe substitutions', 'Macro-balanced meals'],
  },
  {
    icon: <FiTrendingUp size={28} />,
    emoji: '📊',
    title: 'Full Nutrition Data',
    desc: 'Every recipe comes with a complete nutritional breakdown — calories, protein, carbs, fat, and fiber — so you can cook with confidence and hit your health targets.',
    color: '#ef4444',
    perks: ['Calorie tracking', 'Macro breakdown', 'Per-serving calculations'],
  },
  {
    icon: <FiHeart size={28} />,
    emoji: '❤️',
    title: 'Your Personal Cookbook',
    desc: 'Save unlimited recipes to your personal cookbook. Search, filter, and revisit your favorites anytime — building a collection that\'s uniquely yours.',
    color: '#ec4899',
    perks: ['Unlimited saves', 'Smart filtering', 'Instant search'],
  },
]

const STATS = [
  { value: '50K+', label: 'Recipes Generated', icon: '🍽️' },
  { value: '120+', label: 'Cuisines Covered', icon: '🌍' },
  { value: '98%', label: 'Satisfaction Rate', icon: '⭐' },
  { value: '12K+', label: 'Happy Cooks', icon: '👨‍🍳' },
]

const MISSION_POINTS = [
  'Make home cooking exciting and effortless for everyone',
  'Reduce food waste by using what you already have',
  'Democratize access to professional-quality recipes',
  'Help people eat healthier without giving up on taste',
]

const TEAM_VALUES = [
  { emoji: '🔬', title: 'Innovation First', desc: 'We constantly push the boundaries of what AI can do in the kitchen.' },
  { emoji: '🌱', title: 'Sustainability', desc: 'We\'re passionate about reducing food waste and promoting mindful cooking.' },
  { emoji: '🤝', title: 'Community', desc: 'We build for real people — home cooks, beginners, and culinary enthusiasts alike.' },
  { emoji: '✨', title: 'Delight', desc: 'Every interaction should feel magical. We obsess over the details that make cooking joyful.' },
]

export default function AboutPage() {
  useScrollReveal()
  useMagneticButtons()

  return (
    <div className="about-page">

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-hero__blob about-hero__blob--teal" />
        <div className="about-hero__blob about-hero__blob--purple" />
        <div className="about-hero__grid" />
        <div className="container about-hero__content">
          <span className="section-label animate-fade-in-down">✨ Our Story</span>
          <h1 className="about-hero__title animate-fade-in-up delay-100">
            Cooking Reimagined with <span className="gradient-text">Artificial Intelligence</span>
          </h1>
          <p className="about-hero__subtitle animate-fade-in-up delay-200">
            We believe everyone deserves to cook incredible food. RecipeAI was born
            from a simple idea — what if you could have a world-class chef in your pocket,
            available 24/7, who knows exactly what's in your fridge?
          </p>
          <div className="about-hero__actions animate-fade-in-up delay-300">
            <Link to="/generator" className="btn btn-primary btn-lg">
              <FiZap size={18} /> Try RecipeAI Free
            </Link>
            <a href="#why-choose-us" className="btn btn-ghost btn-lg">
              Why Choose Us <FiArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Floating badges */}
        <div className="about-hero__badges animate-fade-in delay-400">
          {STATS.map((s, i) => (
            <div key={s.label} className="about-stat-badge animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
              <span className="about-stat-badge__emoji">{s.icon}</span>
              <div>
                <div className="about-stat-badge__val">{s.value}</div>
                <div className="about-stat-badge__label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="section about-mission">
        <div className="container about-mission__grid">
          <div className="about-mission__text" data-reveal="left">
            <span className="section-label">Our Mission</span>
            <h2 className="section-title">
              Making the World Cook <span>Better, Together</span>
            </h2>
            <p className="about-mission__desc">
              RecipeAI was founded with a clear mission: to remove the barriers between people
              and great food. Whether you're a beginner scared of the kitchen, or an experienced
              cook looking for fresh inspiration — we're here to spark creativity and confidence.
            </p>
            <ul className="about-mission__list">
              {MISSION_POINTS.map((point, i) => (
                <li key={i} className="about-mission__item">
                  <span className="about-mission__check"><FiCheck size={14} /></span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="about-mission__visual" data-reveal="right">
            <div className="about-mission__card glass-card">
              <div className="about-mission__card-top">
                <span style={{ fontSize: 48 }}>🍳</span>
                <div>
                  <div className="about-mission__card-title">AI Recipe Generated</div>
                  <div className="about-mission__card-sub">Spaghetti Carbonara • 30 min</div>
                </div>
              </div>
              <div className="about-mission__card-stats">
                {[['🔥', '520', 'kcal'], ['💪', '28g', 'protein'], ['⏱', '30', 'min'], ['🌟', '4.9', 'rating']].map(([e, v, l]) => (
                  <div key={l} className="about-mission__mini-stat">
                    <span>{e}</span>
                    <strong>{v}</strong>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
              <div className="about-mission__card-tag">
                <FiStar size={12} /> AI-Personalized just for you
              </div>
            </div>
            {/* decorative blobs */}
            <div className="about-mission__deco-1 animate-float-slow" />
            <div className="about-mission__deco-2 animate-float" />
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="section why-choose-us" id="why-choose-us">
        <div className="container">
          <div className="section-header" data-reveal="up">
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title">
              Everything That Makes <span>RecipeAI Special</span>
            </h2>
            <p className="section-desc">
              We didn't just build another recipe app. We built the smartest cooking companion
              on the planet — here's why thousands of cooks trust us every day.
            </p>
          </div>

          <div className="wcu-grid">
            {WHY_CHOOSE_US.map((item, i) => (
              <div
                key={item.title}
                className="wcu-card glass-card"
                data-reveal="up"
                data-reveal-delay={i * 100}
              >
                <div className="wcu-card__icon-wrap" style={{ '--accent-color': item.color }}>
                  <span className="wcu-card__emoji">{item.emoji}</span>
                  <div className="wcu-card__icon-bg" />
                </div>
                <h3 className="wcu-card__title">{item.title}</h3>
                <p className="wcu-card__desc">{item.desc}</p>
                <ul className="wcu-card__perks">
                  {item.perks.map((perk) => (
                    <li key={perk} className="wcu-card__perk">
                      <FiCheck size={13} style={{ color: item.color, flexShrink: 0 }} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="section about-values">
        <div className="container">
          <div className="section-header" data-reveal="up">
            <span className="section-label">Our Values</span>
            <h2 className="section-title">What We Stand <span>For</span></h2>
          </div>
          <div className="values-grid">
            {TEAM_VALUES.map((v, i) => (
              <div key={v.title} className="value-card glass-card" data-reveal="zoom" data-reveal-delay={i * 120}>
                <div className="value-card__emoji">{v.emoji}</div>
                <h3 className="value-card__title">{v.title}</h3>
                <p className="value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section about-cta">
        <div className="container">
          <div className="about-cta__inner glass-card" data-reveal="zoom">
            <div className="about-cta__blob" />
            <span className="section-label">Ready to Start?</span>
            <h2 className="about-cta__title">
              Join <span className="gradient-text">12,000+</span> Cooks Already Using RecipeAI
            </h2>
            <p className="about-cta__desc">
              No account needed. No credit card. Just incredible recipes — instantly.
            </p>
            <div className="about-cta__btns">
              <Link to="/generator" className="btn btn-primary btn-lg">
                <FiZap size={20} /> Generate Your First Recipe
              </Link>
              <Link to="/" className="btn btn-ghost btn-lg">
                Explore Home
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
