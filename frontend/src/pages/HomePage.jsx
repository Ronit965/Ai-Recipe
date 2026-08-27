import { useRef, useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiZap, FiHeart, FiChevronDown, FiRefreshCw, FiTrendingUp } from 'react-icons/fi'
import RecipeCard from '../components/RecipeCard'
import { useRecipe } from '../context/RecipeContext'
import { useTheme } from '../context/ThemeContext'
import {
  useScrollReveal,
  useParticles,
  useMagneticButtons,
  useTypewriter,
} from '../hooks/useAnimations'
import './HomePage.css'

const TRENDING_TABS = [
  { id: 'all', label: '🔥 All Trending' },
  { id: 'quick', label: '⚡ Under 25 Mins' },
  { id: 'veg', label: '🥗 Veg & Fresh' },
  { id: 'protein', label: '🍗 High Protein' },
  { id: 'comfort', label: '🍝 Comfort Classics' },
]

const TRENDING_BADGES = [
  '🔥 #1 Trending',
  '⭐ Top Rated',
  '👨‍🍳 Chef Pick',
  '⚡ 20-Min Fast',
  '🥑 Fresh & Fit',
  '🍕 Crowd Favorite',
  '🌮 Street Style',
  '✨ Gourmet Pick',
]

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered', desc: "Advanced AI understands your preferences and dietary needs to craft the perfect recipe." },
  { icon: '🥦', title: 'Ingredient-Based', desc: "Just list what's in your fridge and we'll figure out what to cook—zero waste guaranteed." },
  { icon: '⚡', title: 'Instant Results', desc: 'Get curated, step-by-step recipes in seconds. No more endless scrolling.' },
  { icon: '🌍', title: 'Global Cuisines', desc: 'Explore recipes from Italian, Thai, Mexican, Indian, and 50+ other world cuisines.' },
  { icon: '📊', title: 'Nutrition Tracking', desc: 'Every recipe comes with full macro breakdown—calories, protein, carbs, and fat.' },
  { icon: '❤️', title: 'Save Favorites', desc: 'Save any recipe to your personal cookbook with one tap and revisit it anytime.' },
]

const FAQS = [
  {
    q: 'Is RecipeAI completely free to use?',
    a: 'Yes! RecipeAI is free to use — you can generate recipes, view ingredients, steps, and full nutrition without any account. Creating a free account unlocks saving unlimited recipes to your personal cookbook.',
  },
  {
    q: 'How does the AI generate recipes?',
    a: 'Our AI is powered by state-of-the-art language models trained on millions of recipes from around the world. You type a dish name, apply optional filters (cuisine, diet, time), and the AI crafts a complete, personalised recipe in seconds.',
  },
  {
    q: 'Can I filter recipes by dietary restrictions?',
    a: 'Absolutely. The Generator page includes filters for Vegetarian, Vegan, Gluten-Free, Keto, Dairy-Free, High-Protein, Low-Calorie, and more. You can also filter by cuisine style, cooking time, difficulty, meal type, and number of servings.',
  },
  {
    q: 'What cuisines does RecipeAI support?',
    a: 'RecipeAI supports 120+ cuisines including Indian, Italian, Mexican, Chinese, Japanese, Thai, French, Mediterranean, Korean, Middle Eastern, American, and many more — as well as exciting fusion combinations.',
  },
  {
    q: 'Does it provide nutritional information?',
    a: 'Yes, every generated recipe includes a full nutritional breakdown per serving — calories, protein, carbohydrates, fat, and dietary fibre — so you can cook with confidence and hit your health targets.',
  },
  {
    q: 'Can the AI suggest ingredient substitutions?',
    a: 'Yes! If you\'re missing an ingredient or want a healthier swap, RecipeAI\'s AI understands common substitutions — like using Greek yogurt instead of cream, or flax eggs instead of regular eggs for vegan baking.',
  },
  {
    q: 'Can I adjust the number of servings?',
    a: 'Absolutely. Before generating a recipe, use the Servings filter to choose from 1 to 50 people, or enter a custom number. The AI adjusts ingredient quantities automatically so you never have to do the maths yourself.',
  },
  {
    q: 'Is RecipeAI suitable for beginner cooks?',
    a: 'Definitely. Use the "Easy" difficulty filter to get beginner-friendly recipes with simple techniques and readily available ingredients. Each recipe also includes clear, numbered step-by-step instructions written in plain language.',
  },
  {
    q: 'Can I use RecipeAI on my phone or tablet?',
    a: 'Yes! RecipeAI is fully responsive and works beautifully on all screen sizes — phones, tablets, and desktops. You can generate and follow recipes right from your kitchen counter without any app download required.',
  },
  {
    q: 'How do I save a recipe to my cookbook?',
    a: 'After generating a recipe, click the bookmark icon on the recipe card to save it instantly. All saved recipes appear on your Saved Recipes page, where you can search and filter your personal collection anytime.',
  },
  {
    q: 'Can I share recipes with friends or family?',
    a: 'Yes! Each generated recipe can be shared via link. Simply copy the recipe page URL and send it to anyone — they can view the full recipe without needing an account on RecipeAI.',
  },
  {
    q: 'What if I have multiple food allergies?',
    a: 'You can combine multiple dietary filters at once — for example, selecting both Gluten-Free and Dairy-Free at the same time. RecipeAI\'s AI respects all selected restrictions when crafting your recipe.',
  },
  {
    q: 'Are the recipes safe to follow from a food safety perspective?',
    a: 'RecipeAI\'s recipes follow standard culinary food safety practices — including proper cooking temperatures and safe food handling. However, we always recommend checking current food safety guidelines from your local health authority for high-risk ingredients.',
  },
  {
    q: 'How accurate are the generated recipes?',
    a: 'Our AI generates recipes based on deep culinary knowledge and real cooking techniques. While every recipe is curated for quality, we always recommend reading through a recipe before cooking and adjusting seasonings to your personal taste.',
  },
  {
    q: 'Do I need to create an account to use RecipeAI?',
    a: 'No account is required to generate and view recipes. However, creating a free account unlocks the ability to save recipes, personalise your preferences, and build your personal cookbook over time.',
  },
  {
    q: 'How can I give feedback or suggest new features?',
    a: 'We love hearing from our community! Visit our About page and reach out via the contact link. Your feedback directly shapes future updates — from new cuisine types to UI improvements and beyond.',
  },
]

const STEPS = [
  { num: '01', icon: '🥕', title: 'List Your Ingredients', desc: 'Enter what you have on hand or select from dietary preferences.' },
  { num: '02', icon: '🤖', title: 'AI Crafts Recipes', desc: 'Our AI analyzes your inputs and generates personalized recipe ideas.' },
  { num: '03', icon: '🍽️', title: 'Cook & Enjoy', desc: 'Follow the step-by-step guide and impress everyone at the table.' },
]

const STATS = [
  { value: '50K+', label: 'Recipes Generated' },
  { value: '120+', label: 'Cuisines Covered' },
  { value: '98%', label: 'User Satisfaction' },
  { value: '4s', label: 'Avg Generation Time' },
]

const TYPEWRITER_WORDS = ['Culinary Magic', 'Perfect Meals', 'Tasty Wonders', 'Chef Recipes']

/* Ripple helper */
function addRipple(e) {
  const btn = e.currentTarget
  const circle = document.createElement('span')
  const diameter = Math.max(btn.clientWidth, btn.clientHeight)
  const rect = btn.getBoundingClientRect()
  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${e.clientX - rect.left - diameter / 2}px`
  circle.style.top = `${e.clientY - rect.top - diameter / 2}px`
  circle.className = 'ripple-circle'
  btn.querySelectorAll('.ripple-circle').forEach((r) => r.remove())
  btn.appendChild(circle)
}

export default function HomePage() {
  const { MOCK_RECIPES } = useRecipe()
  const { theme } = useTheme()
  const [openFaq, setOpenFaq] = useState(null)
  const [activeTrendingTab, setActiveTrendingTab] = useState('all')
  const [shuffleIndex, setShuffleIndex] = useState(0)
  const [isShuffling, setIsShuffling] = useState(false)

  const canvasRef = useRef(null)
  const typewriterRef = useRef(null)

  /* Computed trending recipes with rotation and filters */
  const trendingRecipesList = useMemo(() => {
    let list = Array.isArray(MOCK_RECIPES) && MOCK_RECIPES.length > 0 ? [...MOCK_RECIPES] : []

    if (list.length === 0) return []

    // Rotate list when user shuffles
    if (shuffleIndex > 0 && list.length > 1) {
      const offset = shuffleIndex % list.length
      list = [...list.slice(offset), ...list.slice(0, offset)]
    }

    if (activeTrendingTab === 'quick') {
      const filtered = list.filter(r => (r.time || 30) <= 25)
      return filtered.length > 0 ? filtered : list
    } else if (activeTrendingTab === 'veg') {
      const filtered = list.filter(r =>
        r.tags?.some(t => ['vegetarian', 'vegan', 'salad', 'pasta', 'healthy'].includes(t.toLowerCase())) ||
        ['Italian', 'Mexican'].includes(r.cuisine)
      )
      return filtered.length > 0 ? filtered : list
    } else if (activeTrendingTab === 'protein') {
      const filtered = list.filter(r =>
        r.tags?.some(t => ['chicken', 'salmon', 'high-protein', 'seafood'].includes(t.toLowerCase())) ||
        parseInt(r.nutrition?.protein || '0', 10) >= 20 ||
        r.title?.toLowerCase().includes('chicken') || r.title?.toLowerCase().includes('salmon')
      )
      return filtered.length > 0 ? filtered : list
    } else if (activeTrendingTab === 'comfort') {
      const filtered = list.filter(r =>
        r.tags?.some(t => ['pasta', 'pizza', 'curry', 'risotto', 'comfort', 'rich'].includes(t.toLowerCase())) ||
        ['Italian', 'Indian'].includes(r.cuisine)
      )
      return filtered.length > 0 ? filtered : list
    }

    return list
  }, [MOCK_RECIPES, activeTrendingTab, shuffleIndex])

  const handleShuffle = () => {
    setIsShuffling(true)
    setShuffleIndex(prev => prev + 1)
    setTimeout(() => setIsShuffling(false), 500)
  }

  /* hooks */
  useScrollReveal()
  useParticles(canvasRef, theme)
  useMagneticButtons()
  useTypewriter(typewriterRef, TYPEWRITER_WORDS)

  /* Ripple on all primary/accent buttons */
  useEffect(() => {
    const btns = document.querySelectorAll('.btn-primary, .btn-accent')
    btns.forEach((btn) => {
      btn.classList.add('ripple-btn')
      btn.addEventListener('click', addRipple)
    })
    return () => btns.forEach((btn) => btn.removeEventListener('click', addRipple))
  }, [])

  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section className="hero">
        {/* Particle canvas */}
        <canvas ref={canvasRef} className="particle-canvas" />

        {/* Background blobs */}
        <div className="hero__blob hero__blob--teal" />
        <div className="hero__blob hero__blob--red" />
        <div className="hero__grid" />

        <div className="container hero__content">
          <div className="animate-fade-in-down">
            <span className="section-label">
              <span className="sparkle">✨</span> AI-Powered Cooking Assistant
            </span>
          </div>

          <h1 className="hero__title animate-fade-in-up delay-100">
            Turn Your Ingredients<br />
            Into{' '}
            <span
              ref={typewriterRef}
              className="gradient-text typewriter-cursor"
            >
              Culinary Magic
            </span>
          </h1>

          <p className="hero__subtitle animate-fade-in-up delay-200">
            Simply tell us what ingredients you have, and our AI will instantly craft
            personalized, restaurant-quality recipes tailored just for you.
          </p>

          <div className="hero__actions animate-fade-in-up delay-300">
            <Link to="/generator" className="btn btn-primary btn-lg shimmer-hover">
              <FiZap size={20} />
              Generate Recipe Now
            </Link>
            <Link to="/saved" className="btn btn-ghost btn-lg">
              <FiHeart size={18} />
              Browse Favorites
            </Link>
          </div>

          {/* Trust row */}
          <div className="hero__trust animate-fade-in-up delay-400">
            <div className="hero__trust-avatars">
              {['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👩‍🍳'].map((a, i) => (
                <span key={i} className="hero__trust-avatar">{a}</span>
              ))}
            </div>
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>12,000+</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>happy cooks this week</span>
            </span>
            <div className="hero__trust-stars">
              {'★★★★★'} <span>4.9</span>
            </div>
          </div>
        </div>

        {/* Hero floating cards */}
        <div className="hero__floating-cards">
          <div className="hero__float-card animate-float shimmer-hover">
            <span style={{ fontSize: 28 }}>🍝</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Creamy Pasta</div>
              <div style={{ fontSize: 12, color: 'var(--secondary)' }}>⏱ 25 min • Easy</div>
            </div>
          </div>
          <div className="hero__float-card hero__float-card--2 animate-float shimmer-hover" style={{ animationDelay: '1.5s' }}>
            <span style={{ fontSize: 28 }}>🥑</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Avocado Salad</div>
              <div style={{ fontSize: 12, color: 'var(--secondary)' }}>⏱ 15 min • Vegan</div>
            </div>
          </div>
          <div className="hero__float-card hero__float-card--3 animate-float shimmer-hover" style={{ animationDelay: '0.8s' }}>
            <span style={{ fontSize: 28 }}>🐟</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Honey Salmon</div>
              <div style={{ fontSize: 12, color: 'var(--secondary)' }}>⏱ 30 min • Healthy</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-band">
        <div className="container stats-band__grid">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="stats-band__item"
              data-reveal="zoom"
              data-reveal-delay={i * 120}
            >
              <span className="stats-band__value">{s.value}</span>
              <span className="stats-band__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header" data-reveal="up">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Three Steps to a <span>Perfect Meal</span></h2>
            <p className="section-desc">Our AI handles all the complexity. You just cook and enjoy.</p>
          </div>

          <div className="steps-grid">
            {STEPS.map((step, idx) => (
              <div
                key={step.num}
                className="step-card glass-card shimmer-hover"
                data-reveal="up"
                data-reveal-delay={idx * 150}
              >
                <div className="step-card__num">{step.num}</div>
                <div className="step-card__icon">{step.icon}</div>
                <h3 className="step-card__title">{step.title}</h3>
                <p className="step-card__desc">{step.desc}</p>
                {idx < STEPS.length - 1 && (
                  <div className="step-card__connector">
                    <FiArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section features">
        <div className="container">
          <div className="section-header" data-reveal="up">
            <span className="section-label">Features</span>
            <h2 className="section-title">Everything You Need to <span>Cook Smarter</span></h2>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-card glass-card"
                data-reveal="up"
                data-reveal-delay={i * 100}
              >
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POPULAR RECIPES ===== */}
      <section className="section popular-recipes">
        <div className="container">
          <div className="section-header section-header--row" data-reveal="up">
            <div>
              <span className="section-label">
                <span className="sparkle">✨</span> Popular & Curated
              </span>
              <h2 className="section-title">Trending <span>This Week</span></h2>
              <p className="section-desc" style={{ marginTop: 6 }}>
                Fresh culinary inspiration handpicked for this week. Explore top community favorites.
              </p>
            </div>
            <div className="trending-header-actions">
              <button
                className={`btn btn-ghost ${isShuffling ? 'btn-spinning' : ''}`}
                onClick={handleShuffle}
                title="Shuffle trending recipes"
                aria-label="Shuffle trending recipes"
              >
                <FiRefreshCw size={15} className={isShuffling ? 'spin-icon' : ''} />
                Shuffle Picks
              </button>
              <Link to="/generator" className="btn btn-outline">
                Generate More <FiArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Trending Filter Tabs */}
          <div className="trending-tabs-row" data-reveal="up">
            {TRENDING_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`trending-tab-btn ${activeTrendingTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTrendingTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Recipes Grid */}
          <div className="recipes-grid">
            {trendingRecipesList.map((recipe, i) => (
              <div
                key={recipe.id || i}
                data-reveal="up"
                data-reveal-delay={i * 80}
              >
                <RecipeCard
                  recipe={recipe}
                  badge={TRENDING_BADGES[i % TRENDING_BADGES.length]}
                />
              </div>
            ))}
          </div>

          {/* Bottom Explore Banner */}
          <div className="trending-bottom-cta" data-reveal="up">
            <p>
              Looking for something specific with what's in your fridge?
            </p>
            <Link to="/generator" className="btn btn-primary btn-sm">
              <FiZap size={15} /> Try Ingredient Generator
            </Link>
          </div>
        </div>
      </section>
      {/* ===== FAQ ===== */}
      <section className="section home-faq">
        <div className="container">
          <div className="section-header" data-reveal="up">
            <span className="section-label">Got Questions?</span>
            <h2 className="section-title">
              Frequently Asked <span>Questions</span>
            </h2>
            <p className="section-desc">
              Everything you need to know about RecipeAI — answered.
            </p>
          </div>

          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div key={i} data-reveal="up" data-reveal-delay={i * 60}>
                <div className={`faq-item glass-card ${openFaq === i ? 'faq-item--open' : ''}`}>
                  <button
                    className="faq-question"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span className="faq-question__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="faq-question__text">{faq.q}</span>
                    <span className={`faq-chevron ${openFaq === i ? 'faq-chevron--open' : ''}`}>
                      <FiChevronDown size={20} />
                    </span>
                  </button>
                  <div className="faq-answer">
                    <p className="faq-answer__text">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="faq-cta" data-reveal="up">
            <span>Still have questions?</span>
            <Link to="/about" className="btn btn-ghost btn-sm">
              Learn more about us <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="section cta-banner">
        <div className="container">
          <div className="cta-banner__inner glass-card" data-reveal="zoom">
            <div className="cta-banner__blob" />
            <canvas className="particle-canvas cta-canvas" style={{ borderRadius: 'var(--radius-lg)' }} />
            <div className="cta-banner__content">
              <span className="section-label">Ready to Cook?</span>
              <h2 className="cta-banner__title">
                Start Generating Your <br />
                <span className="gradient-text">Dream Recipes Today</span>
              </h2>
              <p className="cta-banner__desc">
                Join thousands of home cooks discovering new culinary adventures every day.
              </p>
              <Link to="/generator" className="btn btn-primary btn-lg shimmer-hover">
                <FiZap size={20} />
                Try It Free — No Signup
              </Link>
            </div>
            <div className="cta-banner__emojis">
              {['🍕', '🍣', '🥘', '🍜', '🥗', '🍛'].map((e, i) => (
                <span
                  key={i}
                  className="cta-banner__emoji animate-float"
                  style={{ animationDelay: `${i * 0.4}s`, fontSize: 36 + (i % 3) * 8 }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
