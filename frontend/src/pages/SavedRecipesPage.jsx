import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiZap, FiSearch, FiTrash2, FiHeart } from 'react-icons/fi'
import RecipeCard from '../components/RecipeCard'
import { useRecipe } from '../context/RecipeContext'
import { useScrollReveal } from '../hooks/useAnimations'
import './SavedRecipesPage.css'

const FILTER_OPTIONS = ['All', 'Easy', 'Medium', 'Hard']
const CUISINE_FILTERS = ['All', 'Italian', 'Thai', 'Mexican', 'American', 'Japanese']

export default function SavedRecipesPage() {
  const { savedRecipes, saveRecipe } = useRecipe()
  const [search, setSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState('All')
  const [cuisineFilter, setCuisineFilter] = useState('All')

  useScrollReveal()

  const filtered = savedRecipes.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchDiff = diffFilter === 'All' || r.difficulty === diffFilter
    const matchCuisine = cuisineFilter === 'All' || r.cuisine === cuisineFilter
    return matchSearch && matchDiff && matchCuisine
  })

  const clearAll = () => {
    savedRecipes.forEach(r => saveRecipe(r))
  }

  return (
    <div className="saved-page">
      {/* Header */}
      <div className="saved-page__header">
        <div className="saved-page__header-blob" />
        <div className="container">
          <span className="section-label animate-fade-in-down">My Cookbook</span>
          <h1 className="saved-page__title animate-fade-in-up delay-100">
            Your Saved <span className="gradient-text">Recipes</span>
          </h1>
          <p className="saved-page__subtitle animate-fade-in-up delay-200">
            {savedRecipes.length > 0
              ? `You have ${savedRecipes.length} saved recipe${savedRecipes.length > 1 ? 's' : ''} in your personal cookbook.`
              : 'Your personal recipe collection — save recipes you love!'
            }
          </p>
        </div>
      </div>

      <div className="container saved-page__body">
        {savedRecipes.length === 0 ? (
          /* Empty state */
          <div className="saved-empty">
            <div className="saved-empty__icon animate-float">❤️</div>
            <h2>No Saved Recipes Yet</h2>
            <p>
              Start exploring and save recipes you love by clicking the
              <FiHeart size={15} style={{ margin: '0 6px', verticalAlign: 'middle', color: 'var(--accent-light)' }} />
              button on any recipe card.
            </p>
            <Link to="/generator" className="btn btn-primary btn-lg" style={{ marginTop: 20 }}>
              <FiZap size={20} /> Generate Recipes
            </Link>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="saved-toolbar glass-card shimmer-hover" data-reveal="up">
              {/* Search */}
              <div className="saved-search-wrap">
                <FiSearch size={16} className="saved-search-icon" />
                <input
                  className="saved-search-input"
                  placeholder="Search recipes or tags..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="saved-filters">
                <div className="filter-group">
                  <span className="filter-label">Difficulty:</span>
                  <div className="filter-chips">
                    {FILTER_OPTIONS.map(f => (
                      <button
                        key={f}
                        className={`filter-chip ${diffFilter === f ? 'active' : ''}`}
                        onClick={() => setDiffFilter(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <span className="filter-label">Cuisine:</span>
                  <div className="filter-chips">
                    {CUISINE_FILTERS.map(f => (
                      <button
                        key={f}
                        className={`filter-chip ${cuisineFilter === f ? 'active' : ''}`}
                        onClick={() => setCuisineFilter(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {savedRecipes.length > 0 && (
                <button className="btn btn-ghost btn-sm saved-clear-btn" onClick={clearAll}>
                  <FiTrash2 size={14} /> Clear All
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="saved-stats">
              <div className="saved-stat-item">
                <span className="saved-stat-val">{savedRecipes.length}</span>
                <span className="saved-stat-label">Saved</span>
              </div>
              <div className="saved-stat-item">
                <span className="saved-stat-val">
                  {Math.round(savedRecipes.reduce((a, r) => a + r.time, 0) / savedRecipes.length)}
                </span>
                <span className="saved-stat-label">Avg Min</span>
              </div>
              <div className="saved-stat-item">
                <span className="saved-stat-val">
                  {Math.round(savedRecipes.reduce((a, r) => a + r.calories, 0) / savedRecipes.length)}
                </span>
                <span className="saved-stat-label">Avg Cal</span>
              </div>
              <div className="saved-stat-item">
                <span className="saved-stat-val">
                  {(savedRecipes.reduce((a, r) => a + r.rating, 0) / savedRecipes.length).toFixed(1)}
                </span>
                <span className="saved-stat-label">Avg Rating</span>
              </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="saved-no-results">
                <span style={{ fontSize: 48 }}>🔍</span>
                <h3>No recipes match your search</h3>
                <p>Try a different search term or filter combination.</p>
              </div>
            ) : (
              <div className="saved-grid">
                {filtered.map((recipe, i) => (
                  <div key={recipe.id} data-reveal="up" data-reveal-delay={i * 80}>
                    <RecipeCard recipe={recipe} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
