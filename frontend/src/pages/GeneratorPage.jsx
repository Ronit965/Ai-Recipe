import { useState, useRef, useEffect, useMemo } from 'react'
import {
  FiSearch, FiX, FiClock, FiUsers, FiZap, FiCheckCircle,
  FiSliders, FiChevronDown, FiChevronUp, FiPlay, FiVideo, FiExternalLink, FiHeart,
  FiVolume2, FiVolumeX
} from 'react-icons/fi'
import { useRecipe } from '../context/RecipeContext'
import { useScrollReveal, useMagneticButtons } from '../hooks/useAnimations'
import { getLocalizedRecipe, speakRecipeText, stopSpeaking } from '../utils/hindiTranslation'
import './GeneratorPage.css'

/* ─── Filter Data ─────────────────────────────────── */
const CUISINES = [
  { label: 'Any', emoji: '🌐' },
  { label: 'Indian', emoji: '🇮🇳' },
  { label: 'Italian', emoji: '🇮🇹' },
  { label: 'American', emoji: '🇺🇸' },
  { label: 'Chinese', emoji: '🇨🇳' },
  { label: 'Japanese', emoji: '🇯🇵' },
  { label: 'Mexican', emoji: '🇲🇽' },
  { label: 'Thai', emoji: '🇹🇭' },
  { label: 'French', emoji: '🇫🇷' },
  { label: 'Mediterranean', emoji: '🫒' },
  { label: 'Korean', emoji: '🇰🇷' },
  { label: 'Middle Eastern', emoji: '🧆' },
]

const TIME_OPTIONS = [
  { label: 'Any', value: null },
  { label: '< 15 min', value: 15, icon: '⚡' },
  { label: '< 30 min', value: 30, icon: '🕐' },
  { label: '< 60 min', value: 60, icon: '🕑' },
  { label: '1–2 hrs', value: 120, icon: '🕒' },
  { label: '2+ hrs', value: 999, icon: '🍖' },
]

const DIFFICULTY_OPTIONS = [
  { label: 'Any', color: null },
  { label: 'Easy', color: '#00cba3' },
  { label: 'Medium', color: '#f59e0b' },
  { label: 'Hard', color: '#ef4444' },
]

const DIET_OPTIONS = [
  { label: 'None', emoji: '🍽️' },
  { label: 'Vegetarian', emoji: '🥦' },
  { label: 'Vegan', emoji: '🌱' },
  { label: 'Gluten-Free', emoji: '🌾' },
  { label: 'Keto', emoji: '🥑' },
  { label: 'Dairy-Free', emoji: '🥛' },
  { label: 'High-Protein', emoji: '💪' },
  { label: 'Low-Calorie', emoji: '🔥' },
]

const MEAL_TYPES = [
  { label: 'Any', emoji: '🍽️' },
  { label: 'Breakfast', emoji: '🌅' },
  { label: 'Lunch', emoji: '☀️' },
  { label: 'Dinner', emoji: '🌙' },
  { label: 'Snack', emoji: '🍿' },
  { label: 'Dessert', emoji: '🍰' },
  { label: 'Drink', emoji: '🥤' },
]

const SERVING_OPTIONS = [1, 2, 4, 6, 8]

const POPULAR_SEARCHES = [
  { name: 'Butter Chicken', emoji: '🍛' },
  { name: 'Paneer Butter Masala', emoji: '🧀' },
  { name: 'Margherita Pizza', emoji: '🍕' },
  { name: 'Spaghetti Carbonara', emoji: '🍝' },
  { name: 'Banana Peanut Butter Protein Pancakes', emoji: '🥞' },
  { name: 'Chicken Biryani', emoji: '🫕' },
  { name: 'Dal Tadka', emoji: '🍲' },
  { name: 'Guacamole', emoji: '🥑' },
]

const DIFFICULTY_COLOR = {
  Easy: 'var(--secondary)',
  Medium: '#f59e0b',
  Hard: 'var(--accent)',
}

const DEFAULT_FILTERS = {
  cuisine: 'Any',
  maxTime: null,
  difficulty: 'Any',
  diet: 'None',
  mealType: 'Any',
  servings: 2,
}

function countActiveFilters(f) {
  let n = 0
  if (f.cuisine !== 'Any') n++
  if (f.maxTime !== null) n++
  if (f.difficulty !== 'Any') n++
  if (f.diet !== 'None') n++
  if (f.mealType !== 'Any') n++
  return n
}

export default function GeneratorPage() {
  const { lookupRecipe, lookupResult, isLooking, lookupError, clearLookup, saveRecipe, isSaved } = useRecipe()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeTab, setActiveTab] = useState('ingredients')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [lang, setLang] = useState('en') // 'en' | 'hi'
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingStep, setSpeakingStep] = useState(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useScrollReveal()
  useMagneticButtons()

  const activeFilterCount = countActiveFilters(filters)

  // Localized recipe calculation
  const baseRecipe = lookupResult
  const recipe = useMemo(() => {
    if (!baseRecipe) return null
    return getLocalizedRecipe(baseRecipe, lang)
  }, [baseRecipe, lang])

  // Stop speaking when recipe changes or unmounts
  useEffect(() => {
    stopSpeaking()
    setIsSpeaking(false)
    setSpeakingStep(null)
    return () => {
      stopSpeaking()
    }
  }, [baseRecipe])

  // Autocomplete
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const apiUrl = (import.meta.env.VITE_API_URL || 'https://ai-recipe-2wpn.vercel.app').replace(/\/+$/, '')
        const res = await fetch(`${apiUrl}/api/recipes/search/?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch { setSuggestions([]) }
    }, 250)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleSearch = (name) => {
    const q = name || query
    if (!q.trim()) return
    setQuery(q)
    setSuggestions([])
    setShowSuggestions(false)
    setActiveTab('ingredients')
    lookupRecipe(q, filters)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') { setSuggestions([]); setShowSuggestions(false) }
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    clearLookup()
    stopSpeaking()
    setIsSpeaking(false)
    setSpeakingStep(null)
    inputRef.current?.focus()
  }

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }))
  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const handleToggleSpeakAll = () => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
      setSpeakingStep(null)
      return
    }

    if (!recipe) return
    setIsSpeaking(true)
    setSpeakingStep('all')

    let speechText = ''
    if (lang === 'hi') {
      speechText = `${recipe.title} की रेसिपी। ${recipe.description || ''}। `
      if (recipe.ingredients?.length) {
        speechText += `सामग्री: `
        recipe.ingredients.forEach(ing => {
          const name = typeof ing === 'string' ? ing : ing.name
          const amount = typeof ing === 'string' ? '' : ing.amount
          speechText += `${amount} ${name}, `
        })
      }
      if (recipe.steps?.length) {
        speechText += `. बनाने की विधि: `
        recipe.steps.forEach((st, idx) => {
          speechText += `स्टेप ${idx + 1}: ${st}. `
        })
      }
    } else {
      speechText = `Recipe for ${recipe.title}. ${recipe.description || ''}. `
      if (recipe.ingredients?.length) {
        speechText += `Ingredients: `
        recipe.ingredients.forEach(ing => {
          const name = typeof ing === 'string' ? ing : ing.name
          const amount = typeof ing === 'string' ? '' : ing.amount
          speechText += `${amount} ${name}, `
        })
      }
      if (recipe.steps?.length) {
        speechText += `. Cooking instructions: `
        recipe.steps.forEach((st, idx) => {
          speechText += `Step ${idx + 1}: ${st}. `
        })
      }
    }

    speakRecipeText(speechText, lang, () => {
      setIsSpeaking(false)
      setSpeakingStep(null)
    })
  }

  const handleSpeakStep = (stepText, index, speakLang = lang) => {
    const key = `step-${index}-${speakLang}`
    if (isSpeaking && speakingStep === key) {
      stopSpeaking()
      setIsSpeaking(false)
      setSpeakingStep(null)
      return
    }

    setIsSpeaking(true)
    setSpeakingStep(key)
    const prompt = speakLang === 'hi' ? `स्टेप ${index + 1}: ${stepText}` : `Step ${index + 1}: ${stepText}`
    speakRecipeText(prompt, speakLang, () => {
      setIsSpeaking(false)
      setSpeakingStep(null)
    })
  }

  const handleSpeakIngredients = () => {
    if (isSpeaking && speakingStep === 'ingredients') {
      stopSpeaking()
      setIsSpeaking(false)
      setSpeakingStep(null)
      return
    }
    setIsSpeaking(true)
    setSpeakingStep('ingredients')
    let text = lang === 'hi' ? 'सामग्री सूची: ' : 'Ingredients list: '
    recipe.ingredients?.forEach(ing => {
      const name = typeof ing === 'string' ? ing : ing.name
      const amount = typeof ing === 'string' ? '' : ing.amount
      text += `${amount} ${name}, `
    })
    speakRecipeText(text, lang, () => {
      setIsSpeaking(false)
      setSpeakingStep(null)
    })
  }

  const handleSpeakNutrition = () => {
    if (isSpeaking && speakingStep === 'nutrition') {
      stopSpeaking()
      setIsSpeaking(false)
      setSpeakingStep(null)
      return
    }
    setIsSpeaking(true)
    setSpeakingStep('nutrition')
    let text = ''
    if (lang === 'hi') {
      text = `पोषण तथ्य: कैलोरी ${recipe.calories} किलो कैलोरी, प्रोटीन ${recipe.nutrition?.protein || ''}, कार्बोहाइड्रेट ${recipe.nutrition?.carbs || ''}, वसा ${recipe.nutrition?.fat || ''}, फाइबर ${recipe.nutrition?.fiber || ''}`
    } else {
      text = `Nutrition facts: Calories ${recipe.calories} kilocalories, Protein ${recipe.nutrition?.protein || ''}, Carbohydrates ${recipe.nutrition?.carbs || ''}, Fat ${recipe.nutrition?.fat || ''}, Fiber ${recipe.nutrition?.fiber || ''}`
    }
    speakRecipeText(text, lang, () => {
      setIsSpeaking(false)
      setSpeakingStep(null)
    })
  }

  return (
    <div className="lookup-page">
      {/* ── Header ── */}
      <div className="lookup-header">
        <div className="lookup-header__blob" />
        <div className="container">
          <span className="section-label animate-fade-in-down">✨ AI Recipe Generator</span>
          <h1 className="lookup-header__title animate-fade-in-up delay-100">
            What Are You <span className="gradient-text">Cooking Today?</span>
          </h1>
          <p className="lookup-header__subtitle animate-fade-in-up delay-200">
            Type any recipe name and instantly get ingredients, steps, and nutrition. Use filters to personalize.
          </p>

          {/* Search Bar */}
          <div className="lookup-search-wrap animate-fade-in-up delay-300">
            <div className={`lookup-search-box ${showSuggestions && suggestions.length ? 'open' : ''}`}>
              <FiSearch size={20} className="lookup-search-icon" />
              <input
                ref={inputRef}
                id="recipe-search-input"
                className="lookup-search-input"
                placeholder="e.g. Butter Chicken, Carbonara, Pad Thai..."
                value={query}
                onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
              />
              {query && (
                <button className="lookup-clear-btn" onClick={handleClear} aria-label="Clear">
                  <FiX size={16} />
                </button>
              )}
              <button
                className="btn btn-primary lookup-search-btn"
                onClick={() => handleSearch()}
                disabled={isLooking || !query.trim()}
                id="find-ingredients-btn"
              >
                {isLooking ? <span className="spinner" /> : <FiZap size={16} />}
                {isLooking ? 'Generating...' : 'Generate Recipe'}
              </button>
            </div>

            {/* Autocomplete */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="lookup-suggestions">
                {suggestions.map(s => (
                  <button
                    key={s.title}
                    className="lookup-suggestion-item"
                    onClick={() => handleSearch(s.title)}
                  >
                    <span className="lookup-suggestion-emoji">{s.emoji}</span>
                    <span className="lookup-suggestion-name">{s.title}</span>
                    <span className="lookup-suggestion-meta">{s.cuisine} · {s.time} min</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Filter Toggle Button ── */}
          <div className="filter-toggle-row animate-fade-in-up delay-400">
            <button
              className={`filter-toggle-btn ${filtersOpen ? 'active' : ''} ${activeFilterCount > 0 ? 'has-active' : ''}`}
              onClick={() => setFiltersOpen(o => !o)}
              id="filter-toggle-btn"
            >
              <FiSliders size={16} />
              Customize Recipe
              {activeFilterCount > 0 && (
                <span className="filter-badge">{activeFilterCount}</span>
              )}
              {filtersOpen ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
            </button>

            {activeFilterCount > 0 && (
              <button className="filter-reset-btn" onClick={resetFilters}>
                <FiX size={13} /> Reset Filters
              </button>
            )}
          </div>

          {/* ── Filter Panel ── */}
          <div className={`filter-panel glass-card ${filtersOpen ? 'filter-panel--open' : ''}`}>
            <div className="filter-panel__inner">

              {/* Cuisine */}
              <div className="filter-section">
                <div className="filter-section__label">🌍 Cuisine Style</div>
                <div className="filter-chips-wrap">
                  {CUISINES.map(c => (
                    <button
                      key={c.label}
                      className={`fchip ${filters.cuisine === c.label ? 'fchip--active' : ''}`}
                      onClick={() => setFilter('cuisine', c.label)}
                    >
                      <span>{c.emoji}</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row: Time + Difficulty + Meal */}
              <div className="filter-row-3">

                {/* Time */}
                <div className="filter-section">
                  <div className="filter-section__label">⏱ Cooking Time</div>
                  <div className="filter-chips-wrap">
                    {TIME_OPTIONS.map(t => (
                      <button
                        key={t.label}
                        className={`fchip ${filters.maxTime === t.value ? 'fchip--active' : ''}`}
                        onClick={() => setFilter('maxTime', t.value)}
                      >
                        {t.icon && <span>{t.icon}</span>} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="filter-section">
                  <div className="filter-section__label">🎯 Difficulty</div>
                  <div className="filter-chips-wrap">
                    {DIFFICULTY_OPTIONS.map(d => (
                      <button
                        key={d.label}
                        className={`fchip ${filters.difficulty === d.label ? 'fchip--active' : ''}`}
                        style={filters.difficulty === d.label && d.color
                          ? { borderColor: d.color, color: d.color, background: `${d.color}18` }
                          : {}
                        }
                        onClick={() => setFilter('difficulty', d.label)}
                      >
                        {d.color && <span className="diff-dot" style={{ background: d.color }} />}
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meal Type */}
                <div className="filter-section">
                  <div className="filter-section__label">🍽️ Meal Type</div>
                  <div className="filter-chips-wrap">
                    {MEAL_TYPES.map(m => (
                      <button
                        key={m.label}
                        className={`fchip ${filters.mealType === m.label ? 'fchip--active' : ''}`}
                        onClick={() => setFilter('mealType', m.label)}
                      >
                        <span>{m.emoji}</span> {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row: Diet + Servings */}
              <div className="filter-row-2">

                {/* Diet */}
                <div className="filter-section">
                  <div className="filter-section__label">🥗 Dietary Preference</div>
                  <div className="filter-chips-wrap">
                    {DIET_OPTIONS.map(d => (
                      <button
                        key={d.label}
                        className={`fchip ${filters.diet === d.label ? 'fchip--active' : ''}`}
                        onClick={() => setFilter('diet', d.label)}
                      >
                        <span>{d.emoji}</span> {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Servings */}
                <div className="filter-section">
                  <div className="filter-section__label">👥 Servings — <strong>{filters.servings} {filters.servings === 1 ? 'person' : 'people'}</strong></div>
                  <div className="servings-row">
                    {SERVING_OPTIONS.map(n => (
                      <button
                        key={n}
                        className={`serving-btn ${filters.servings === n ? 'serving-btn--active' : ''}`}
                        onClick={() => setFilter('servings', n)}
                      >
                        {n}
                      </button>
                    ))}
                    <div className="servings-custom">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={filters.servings}
                        onChange={e => setFilter('servings', Math.max(1, parseInt(e.target.value) || 1))}
                        className="servings-input"
                        title="Custom servings"
                      />
                      <span>custom</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Summary */}
              {activeFilterCount > 0 && (
                <div className="filter-summary">
                  <span className="filter-summary__label">✅ Active filters:</span>
                  {filters.cuisine !== 'Any' && <span className="filter-tag">{CUISINES.find(c => c.label === filters.cuisine)?.emoji} {filters.cuisine}</span>}
                  {filters.maxTime !== null && <span className="filter-tag">⏱ {TIME_OPTIONS.find(t => t.value === filters.maxTime)?.label}</span>}
                  {filters.difficulty !== 'Any' && <span className="filter-tag">🎯 {filters.difficulty}</span>}
                  {filters.diet !== 'None' && <span className="filter-tag">{DIET_OPTIONS.find(d => d.label === filters.diet)?.emoji} {filters.diet}</span>}
                  {filters.mealType !== 'Any' && <span className="filter-tag">{MEAL_TYPES.find(m => m.label === filters.mealType)?.emoji} {filters.mealType}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Popular Searches */}
          {!recipe && (
            <div className="lookup-popular animate-fade-in-up delay-500">
              <span className="lookup-popular__label">🔥 Popular:</span>
              <div className="lookup-popular__chips">
                {POPULAR_SEARCHES.map(p => (
                  <button key={p.name} className="popular-chip" onClick={() => handleSearch(p.name)}>
                    {p.emoji} {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container lookup-body">
        {/* Error */}
        {lookupError && (
          <div className="lookup-not-found glass-card animate-fade-in">
            <span className="lookup-not-found__icon">🤔</span>
            <h3>Recipe Not Found</h3>
            <p>{lookupError}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
              Try: "Butter Chicken", "Carbonara", "Pad Thai", "Tiramisu"...
            </p>
          </div>
        )}

        {/* Skeleton */}
        {isLooking && (
          <div className="lookup-skeleton animate-fade-in">
            <div className="skeleton lookup-skeleton__hero" />
            <div className="skeleton lookup-skeleton__line" />
            <div className="skeleton lookup-skeleton__line" style={{ width: '70%' }} />
            <div className="skeleton lookup-skeleton__grid">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton lookup-skeleton__ing" />)}
            </div>
          </div>
        )}

        {/* Result */}
        {!isLooking && recipe && (
          <div className="recipe-result animate-fade-in">
            {/* Applied filter tags on result */}
            {activeFilterCount > 0 && (
              <div className="result-filter-tags">
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Generated with:</span>
                {filters.cuisine !== 'Any' && <span className="result-filter-tag">{CUISINES.find(c => c.label === filters.cuisine)?.emoji} {filters.cuisine}</span>}
                {filters.maxTime !== null && <span className="result-filter-tag">⏱ {TIME_OPTIONS.find(t => t.value === filters.maxTime)?.label}</span>}
                {filters.difficulty !== 'Any' && <span className="result-filter-tag">🎯 {filters.difficulty}</span>}
                {filters.diet !== 'None' && <span className="result-filter-tag">{DIET_OPTIONS.find(d => d.label === filters.diet)?.emoji} {filters.diet}</span>}
                {filters.mealType !== 'Any' && <span className="result-filter-tag">{MEAL_TYPES.find(m => m.label === filters.mealType)?.emoji} {filters.mealType}</span>}
                <span className="result-filter-tag">👥 {filters.servings} servings</span>
              </div>
            )}

            {/* Hero */}
            <div className="recipe-result__hero glass-card">
              <div className="recipe-result__emoji">{recipe.emoji}</div>
              <div className="recipe-result__info">
                <div className="recipe-result__header-row">
                  <div className="recipe-result__tags">
                    {recipe.tags?.slice(0, 3).map(t => (
                      <span key={t} className="badge badge-teal">{t}</span>
                    ))}
                    {lang === 'hi' && (
                      <span className="badge badge-primary" style={{ background: 'rgba(255, 153, 51, 0.15)', borderColor: '#ff9933', color: '#ff9933' }}>
                        🇮🇳 हिन्दी
                      </span>
                    )}
                  </div>

                  {/* Save Recipe Button */}
                  <button
                    className={`recipe-save-btn ${isSaved(recipe.id, recipe.title) ? 'saved' : ''}`}
                    onClick={() => saveRecipe(recipe)}
                    aria-label={isSaved(recipe.id, recipe.title) ? 'Unsave recipe' : 'Save recipe to collection'}
                    id="save-recipe-btn"
                  >
                    <FiHeart size={16} />
                    <span>{isSaved(recipe.id, recipe.title) ? (lang === 'hi' ? 'सेव हो गया ❤️' : 'Saved to Cookbook') : (lang === 'hi' ? 'रेसिपी सेव करें' : 'Save Recipe')}</span>
                  </button>
                </div>
                <h2 className="recipe-result__title">{recipe.title}</h2>
                <p className="recipe-result__desc">{recipe.description}</p>
                <div className="recipe-result__meta">
                  <div className="recipe-meta-item">
                    <FiClock size={15} />
                    <span>{recipe.time} {lang === 'hi' ? 'मिनट' : 'min'}</span>
                  </div>
                  <div className="recipe-meta-item">
                    <FiUsers size={15} />
                    <span>{recipe.servings} {lang === 'hi' ? 'सर्विंग' : 'servings'}</span>
                  </div>
                  <div className="recipe-meta-item">
                    <span
                      className="recipe-difficulty-dot"
                      style={{ background: DIFFICULTY_COLOR[recipe.difficulty] || 'var(--secondary)' }}
                    />
                    <span>{recipe.difficulty}</span>
                  </div>
                  <div className="recipe-meta-item">
                    <span>🔥</span>
                    <span>{recipe.calories} {lang === 'hi' ? 'कैलोरी' : 'kcal'}</span>
                  </div>
                  <div className="recipe-meta-item">
                    <span>⭐</span>
                    <span>{recipe.rating}</span>
                  </div>
                  <div className="recipe-meta-item cuisine-badge">
                    <span>🌍</span>
                    <span>{recipe.cuisine}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Language Switcher & Audio Bar ── */}
            <div className="recipe-toolbar-bar glass-card">
              {/* Language Switcher */}
              <div className="lang-switcher">
                <span className="lang-switcher__label">
                  🌐 {lang === 'hi' ? 'भाषा (Language):' : 'Language:'}
                </span>
                <div className="lang-switcher__buttons">
                  <button
                    className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                    onClick={() => {
                      stopSpeaking()
                      setIsSpeaking(false)
                      setSpeakingStep(null)
                      setLang('en')
                    }}
                    id="lang-btn-en"
                  >
                    🇬🇧 English
                  </button>
                  <button
                    className={`lang-btn ${lang === 'hi' ? 'active' : ''}`}
                    onClick={() => {
                      stopSpeaking()
                      setIsSpeaking(false)
                      setSpeakingStep(null)
                      setLang('hi')
                    }}
                    id="lang-btn-hi"
                  >
                    🇮🇳 हिन्दी (Hindi)
                  </button>
                </div>
              </div>

              {/* Audio Speaker Assistant */}
              <div className="audio-controls">
                <button
                  className={`btn-audio-speak ${isSpeaking && speakingStep === 'all' ? 'speaking' : ''}`}
                  onClick={handleToggleSpeakAll}
                  id="read-aloud-btn"
                >
                  {isSpeaking && speakingStep === 'all' ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
                  <span>
                    {isSpeaking && speakingStep === 'all'
                      ? (lang === 'hi' ? '⏹️ आवाज बंद करें' : '⏹️ Stop Audio')
                      : (lang === 'hi' ? '🔊 पूरी रेसिपी सुनें' : '🔊 Read Aloud')}
                  </span>
                  {isSpeaking && speakingStep === 'all' && (
                    <span className="audio-wave-anim">
                      <span className="bar bar1"></span>
                      <span className="bar bar2"></span>
                      <span className="bar bar3"></span>
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="recipe-tabs">
              {[
                { id: 'ingredients', emoji: '🛒', en: 'Ingredients', hi: 'सामग्री (Ingredients)' },
                { id: 'steps', emoji: '👨‍🍳', en: 'Steps', hi: 'बनाने की विधि (Steps)' },
                { id: 'nutrition', emoji: '📊', en: 'Nutrition', hi: 'पोषण तथ्य (Nutrition)' },
                { id: 'video', emoji: '🎬', en: 'Video', hi: 'वीडियो (Video)' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`recipe-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.emoji} {lang === 'hi' ? tab.hi : tab.en}
                </button>
              ))}
            </div>

            {/* Ingredients */}
            {activeTab === 'ingredients' && (
              <div className="ingredients-panel animate-fade-in">
                <div className="ingredients-panel__header">
                  <h3>{lang === 'hi' ? '🛒 आवश्यक सामग्री (Ingredients)' : '🛒 Ingredients'}</h3>
                  <div className="section-header-actions">
                    <button
                      className={`btn-speaker-mini ${isSpeaking && speakingStep === 'ingredients' ? 'speaking' : ''}`}
                      onClick={handleSpeakIngredients}
                      title={lang === 'hi' ? 'सभी सामग्री बोलकर सुनें' : 'Listen to all ingredients'}
                    >
                      <FiVolume2 size={15} />
                      <span>{isSpeaking && speakingStep === 'ingredients' ? (lang === 'hi' ? 'बंद करें' : 'Stop') : (lang === 'hi' ? 'सामग्री सुनें' : 'Listen')}</span>
                    </button>
                    <span className="ingredients-count">
                      {recipe.ingredients?.length} {lang === 'hi' ? 'सामग्री' : 'items'}
                    </span>
                  </div>
                </div>
                <div className="ingredients-grid">
                  {recipe.ingredients?.map((ing, i) => {
                    const primaryName = lang === 'hi' ? (ing.hiName || ing.name) : (ing.enName || ing.name)
                    const primaryAmount = lang === 'hi' ? (ing.hiAmount || ing.amount) : (ing.enAmount || ing.amount)
                    const secondaryName = lang === 'hi' ? ing.enName : ing.hiName
                    const secondaryAmount = lang === 'hi' ? ing.enAmount : ing.hiAmount
                    const note = ing.note || ing.hiNote || ing.enNote

                    return (
                      <div key={i} className="ingredient-item glass-card">
                        <div className="ingredient-item__check"><FiCheckCircle size={18} /></div>
                        <div className="ingredient-item__body">
                          <div className="ingredient-item__main-row">
                            <span className="ingredient-item__name">{primaryName}</span>
                            {primaryAmount && <span className="ingredient-item__amount">{primaryAmount}</span>}
                          </div>
                          {secondaryName && secondaryName !== primaryName && (
                            <div className="ingredient-item__sub-row">
                              <span className="ingredient-item__sub-lang">{lang === 'hi' ? '🇬🇧' : '🇮🇳'}</span>
                              <span className="ingredient-item__sub-text">
                                {secondaryAmount ? `${secondaryAmount} ` : ''}{secondaryName}
                              </span>
                            </div>
                          )}
                          {note && <span className="ingredient-item__note">{note}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Steps */}
            {activeTab === 'steps' && (
              <div className="steps-panel animate-fade-in">
                <div className="steps-panel__header">
                  <div>
                    <h3>{lang === 'hi' ? '👨‍🍳 बनाने की विधि (Step-by-Step Guide)' : '👨‍🍳 Cooking Steps'}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                      {lang === 'hi' ? '📖 अंग्रेजी और हिन्दी दोनों भाषाओं में पढ़ें व सुनें' : '📖 Read & listen in both English and Hindi'}
                    </p>
                  </div>
                  <button
                    className={`btn-speaker-mini ${isSpeaking && speakingStep === 'all' ? 'speaking' : ''}`}
                    onClick={handleToggleSpeakAll}
                    title={lang === 'hi' ? 'सभी स्टेप्स सुनें' : 'Listen to all steps'}
                  >
                    <FiVolume2 size={15} />
                    <span>{isSpeaking && speakingStep === 'all' ? (lang === 'hi' ? 'बंद करें' : 'Stop') : (lang === 'hi' ? 'सभी स्टेप्स सुनें' : 'Listen All')}</span>
                  </button>
                </div>
                <div className="steps-list">
                  {recipe.steps?.map((stepObj, i) => {
                    const enText = typeof stepObj === 'object' ? (stepObj.en || stepObj.text) : stepObj
                    const hiText = typeof stepObj === 'object' ? (stepObj.hi || stepObj.text) : stepObj
                    const isStepSpeaking = speakingStep === `step-${i}-hi` || speakingStep === `step-${i}-en`

                    return (
                      <div key={i} className={`step-item glass-card ${isStepSpeaking ? 'step-item--speaking' : ''}`}>
                        <div className="step-item__num">{String(i + 1).padStart(2, '0')}</div>
                        
                        <div className="step-item__content">
                          {/* Hindi Step Text */}
                          <div className="step-item__lang-block step-item__hi-block">
                            <span className="step-lang-badge step-lang-badge--hi">🇮🇳 हिन्दी</span>
                            <p className="step-item__text step-item__text--hi">{hiText}</p>
                          </div>

                          {/* English Step Text */}
                          <div className="step-item__lang-block step-item__en-block">
                            <span className="step-lang-badge step-lang-badge--en">🇬🇧 English</span>
                            <p className="step-item__text step-item__text--en">{enText}</p>
                          </div>
                        </div>

                        {/* Dual Speaker Buttons */}
                        <div className="step-item__actions">
                          <button
                            className={`step-speaker-btn ${speakingStep === `step-${i}-hi` ? 'active' : ''}`}
                            onClick={() => handleSpeakStep(hiText, i, 'hi')}
                            title={`स्टेप ${i + 1} हिन्दी में सुनें (Listen in Hindi)`}
                            aria-label={`Listen to step ${i + 1} in Hindi`}
                          >
                            <FiVolume2 size={14} />
                            <span className="speaker-lang-tag">HI</span>
                          </button>

                          <button
                            className={`step-speaker-btn ${speakingStep === `step-${i}-en` ? 'active' : ''}`}
                            onClick={() => handleSpeakStep(enText, i, 'en')}
                            title={`Listen to step ${i + 1} in English`}
                            aria-label={`Listen to step ${i + 1} in English`}
                          >
                            <FiVolume2 size={14} />
                            <span className="speaker-lang-tag">EN</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Nutrition */}
            {activeTab === 'nutrition' && recipe.nutrition && (
              <div className="nutrition-panel animate-fade-in">
                <div className="nutrition-panel__header">
                  <h3>{lang === 'hi' ? '📊 प्रति सर्विंग पोषण तथ्य (Nutrition Facts)' : '📊 Nutrition per Serving'}</h3>
                  <button
                    className={`btn-speaker-mini ${isSpeaking && speakingStep === 'nutrition' ? 'speaking' : ''}`}
                    onClick={handleSpeakNutrition}
                    title={lang === 'hi' ? 'पोषण विवरण सुनें' : 'Listen to nutrition'}
                  >
                    <FiVolume2 size={15} />
                    <span>{isSpeaking && speakingStep === 'nutrition' ? (lang === 'hi' ? 'बंद करें' : 'Stop') : (lang === 'hi' ? 'पोषण सुनें' : 'Listen')}</span>
                  </button>
                </div>
                <div className="nutrition-grid">
                  {[
                    { label: lang === 'hi' ? 'कैलोरी (Calories)' : 'Calories', value: `${recipe.calories}`, unit: 'kcal', color: 'var(--accent-light)', icon: '🔥' },
                    { label: lang === 'hi' ? 'प्रोटीन (Protein)' : 'Protein', value: recipe.nutrition.protein, unit: '', color: 'var(--secondary)', icon: '💪' },
                    { label: lang === 'hi' ? 'कार्बोहाइड्रेट (Carbs)' : 'Carbs', value: recipe.nutrition.carbs, unit: '', color: '#f59e0b', icon: '🌾' },
                    { label: lang === 'hi' ? 'वसा (Fat)' : 'Fat', value: recipe.nutrition.fat, unit: '', color: '#a78bfa', icon: '🥑' },
                    { label: lang === 'hi' ? 'फाइबर (Fiber)' : 'Fiber', value: recipe.nutrition.fiber, unit: '', color: '#34d399', icon: '🌿' },
                  ].map(n => (
                    <div key={n.label} className="nutrition-card glass-card">
                      <span className="nutrition-card__icon">{n.icon}</span>
                      <span className="nutrition-card__value" style={{ color: n.color }}>{n.value}{n.unit}</span>
                      <span className="nutrition-card__label">{n.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {activeTab === 'video' && (
              <div className="video-panel animate-fade-in">
                <div className="video-panel__header">
                  <h3>🎬 Video Tutorials & Guides</h3>
                  <p className="video-panel__subtitle">
                    Find top-rated chef tutorials and cooking techniques for <strong>{recipe.title}</strong>
                  </p>
                </div>

                <div className="video-launch-card glass-card">
                  <div className="video-launch-icon">
                    <FiPlay size={32} />
                  </div>
                  <div className="video-launch-content">
                    <h4>Watch Step-by-Step Video Recipes</h4>
                    <p>
                      Explore live demonstrations, chef secrets, and knife techniques for {recipe.title}.
                    </p>
                    <div className="video-actions">
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.title + ' recipe step by step')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        <FiPlay size={16} /> Watch on YouTube
                        <FiExternalLink size={14} style={{ marginLeft: 6 }} />
                      </a>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.title + ' recipe shorts')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost"
                      >
                        📱 Quick Shorts & Reels
                        <FiExternalLink size={14} style={{ marginLeft: 6 }} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="video-tip-card glass-card">
                  <span className="video-tip-icon">💡</span>
                  <div className="video-tip-text">
                    <strong>Cooking Tip:</strong> Look out for how the chef controls cooking heat, tests for doneness, and seasons in layers throughout the video!
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLooking && !recipe && !lookupError && (
          <div className="lookup-empty">

            {/* Decorative background glow */}
            <div className="empty-bg-glow empty-bg-glow--teal" />
            <div className="empty-bg-glow empty-bg-glow--purple" />

            {/* Floating emoji ring */}
            <div className="empty-emoji-ring">
              {[
                { e: '🍕', delay: '0s',    top: '10%',  left: '8%'  },
                { e: '🍜', delay: '0.7s',  top: '5%',   left: '30%' },
                { e: '🍛', delay: '1.4s',  top: '8%',   right: '28%' },
                { e: '🍣', delay: '0.4s',  top: '12%',  right: '6%' },
                { e: '🥗', delay: '1.1s',  bottom: '12%', left: '6%' },
                { e: '🧁', delay: '1.8s',  bottom: '8%',  left: '26%' },
                { e: '🥘', delay: '0.9s',  bottom: '6%',  right: '25%' },
                { e: '🍖', delay: '1.5s',  bottom: '10%', right: '5%' },
              ].map(({ e, delay, ...pos }, i) => (
                <span
                  key={i}
                  className="empty-emoji-float"
                  style={{ animationDelay: delay, ...pos }}
                >
                  {e}
                </span>
              ))}
            </div>

            {/* Centre content */}
            <div className="empty-center">
              <div className="empty-chef-icon animate-float">👨‍🍳</div>
              <h2 className="empty-title">Your Recipe Awaits</h2>
              <p className="empty-subtitle">
                Type any dish above, apply your filters, and let AI craft
                a perfect recipe — ingredients, steps & nutrition included.
              </p>

              {/* Feature pills */}
              <div className="empty-pills">
                {[
                  { icon: '🌍', text: '120+ Cuisines' },
                  { icon: '⚡', text: 'Instant Results' },
                  { icon: '🥗', text: 'Diet-Friendly' },
                  { icon: '📊', text: 'Full Nutrition' },
                  { icon: '👥', text: 'Custom Servings' },
                ].map(({ icon, text }) => (
                  <span key={text} className="empty-pill">
                    {icon} {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview recipe cards */}
            <div className="empty-preview-cards">
              {[
                { emoji: '🍛', name: 'Butter Chicken', time: '35 min', cuisine: 'Indian', cal: '480 kcal', diff: 'Easy', diffColor: '#00cba3', delay: '0s' },
                { emoji: '🍝', name: 'Spaghetti Carbonara', time: '25 min', cuisine: 'Italian', cal: '520 kcal', diff: 'Medium', diffColor: '#f59e0b', delay: '0.15s' },
                { emoji: '🍜', name: 'Pad Thai Noodles', time: '20 min', cuisine: 'Thai', cal: '430 kcal', diff: 'Easy', diffColor: '#00cba3', delay: '0.3s' },
              ].map((r, i) => (
                <div
                  key={r.name}
                  className="empty-card glass-card"
                  style={{ animationDelay: r.delay }}
                  onClick={() => handleSearch(r.name)}
                  title={`Try: ${r.name}`}
                >
                  <div className="empty-card__top">
                    <span className="empty-card__emoji">{r.emoji}</span>
                    <div className="empty-card__info">
                      <div className="empty-card__name">{r.name}</div>
                      <div className="empty-card__meta">
                        <span>⏱ {r.time}</span>
                        <span>🌍 {r.cuisine}</span>
                      </div>
                    </div>
                  </div>
                  <div className="empty-card__bottom">
                    <span className="empty-card__cal">🔥 {r.cal}</span>
                    <span className="empty-card__diff" style={{ color: r.diffColor }}>
                      ● {r.diff}
                    </span>
                    <span className="empty-card__try">Try this →</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
