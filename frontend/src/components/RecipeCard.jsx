import { useState } from 'react'
import { FiClock, FiUsers, FiHeart, FiZap, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useRecipe } from '../context/RecipeContext'
import './RecipeCard.css'

export default function RecipeCard({ recipe, compact = false, badge = null }) {
  const { saveRecipe, isSaved } = useRecipe()
  const [expanded, setExpanded] = useState(false)
  const saved = isSaved(recipe.id)

  const difficultyColor = {
    Easy: 'var(--secondary)',
    Medium: '#f59e0b',
    Hard: 'var(--accent-light)'
  }

  return (
    <article className={`recipe-card glass-card ${compact ? 'recipe-card--compact' : ''}`}>
      {/* Header */}
      <div className="recipe-card__header">
        {badge && <span className="recipe-card__trending-pill">{badge}</span>}
        <div className="recipe-card__emoji-wrap">
          <span className="recipe-card__emoji">{recipe.emoji}</span>
        </div>
        <button
          className={`recipe-card__save-btn ${saved ? 'saved' : ''}`}
          onClick={() => saveRecipe(recipe)}
          aria-label={saved ? 'Unsave recipe' : 'Save recipe'}
        >
          <FiHeart size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="recipe-card__body">
        <div className="recipe-card__meta-row">
          <span className="badge badge-teal">{recipe.cuisine}</span>
          <span className="recipe-card__difficulty" style={{ color: difficultyColor[recipe.difficulty] || '#fff' }}>
            ● {recipe.difficulty}
          </span>
        </div>

        <h3 className="recipe-card__title">{recipe.title}</h3>
        <p className="recipe-card__desc">{recipe.description}</p>

        {/* Stats */}
        <div className="recipe-card__stats">
          <div className="recipe-card__stat">
            <FiClock size={14} />
            <span>{recipe.time} min</span>
          </div>
          <div className="recipe-card__stat">
            <FiUsers size={14} />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="recipe-card__stat">
            <FiZap size={14} />
            <span>{recipe.calories} kcal</span>
          </div>
        </div>

        {/* Tags */}
        <div className="chips-row" style={{ marginTop: 12 }}>
          {recipe.tags.map(tag => (
            <span key={tag} className="badge badge-primary">#{tag}</span>
          ))}
        </div>

        {/* Expandable Details */}
        {!compact && (
          <>
            <button
              className="recipe-card__expand-btn"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? 'Hide Details' : 'View Recipe'}
              {expanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            {expanded && (
              <div className="recipe-card__details animate-fade-in">
                <div className="recipe-card__section">
                  <h4>🛒 Ingredients</h4>
                  <ul>
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>

                <div className="recipe-card__section">
                  <h4>👨‍🍳 Instructions</h4>
                  <ol>
                    {recipe.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Nutrition */}
                <div className="recipe-card__nutrition">
                  <h4>📊 Nutrition per serving</h4>
                  <div className="recipe-card__nutrition-grid">
                    {Object.entries(recipe.nutrition).map(([key, val]) => (
                      <div key={key} className="recipe-card__nutrition-item">
                        <span className="recipe-card__nutrition-val">{val}</span>
                        <span className="recipe-card__nutrition-label">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rating */}
      <div className="recipe-card__footer">
        <div className="recipe-card__rating">
          {'★'.repeat(Math.round(recipe.rating))}{'☆'.repeat(5 - Math.round(recipe.rating))}
          <span>{recipe.rating}</span>
        </div>
        <span className="recipe-card__ai-badge">
          <FiZap size={11} /> AI Generated
        </span>
      </div>
    </article>
  )
}
