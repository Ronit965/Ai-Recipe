import { createContext, useContext, useState, useEffect } from 'react'

const RecipeContext = createContext()

const API_BASE = 'https://ai-recipe-2wpn.vercel.app//api'

// Fallback popular recipes (shown while API loads or as offline defaults)
const FALLBACK_RECIPES = [
  {
    id: 'fallback-1', title: "Creamy Garlic Pasta", cuisine: "Italian", time: 25,
    servings: 4, difficulty: "Easy", calories: 420, rating: 4.8,
    tags: ["pasta", "vegetarian", "quick", "comfort"], emoji: "🍝",
    description: "A rich and velvety pasta dish with roasted garlic, parmesan, and fresh aromatic herbs.",
    ingredients: ["400g spaghetti", "6 cloves garlic", "100ml heavy cream", "80g parmesan", "2 tbsp olive oil", "Fresh basil"],
    steps: ["Cook spaghetti al dente.", "Sauté garlic in olive oil.", "Stir in cream and simmer.", "Toss pasta with sauce and top with parmesan."],
    nutrition: { protein: "16g", carbs: "62g", fat: "14g", fiber: "3g" }
  },
  {
    id: 'fallback-2', title: "Spicy Thai Basil Chicken", cuisine: "Thai", time: 20,
    servings: 2, difficulty: "Easy", calories: 380, rating: 4.9,
    tags: ["chicken", "spicy", "gluten-free", "stir-fry"], emoji: "🌶️",
    description: "Authentic Thai street food stir-fry with fragrant holy basil, garlic, chili, and tender minced chicken.",
    ingredients: ["500g ground chicken", "4 cloves garlic", "3 Thai bird chilies", "2 tbsp oyster sauce", "1 tbsp soy sauce", "1 cup fresh Thai basil"],
    steps: ["Sizzle garlic and chilies in hot wok.", "Add ground chicken and stir-fry until cooked.", "Pour sauce blend and reduce.", "Fold in holy basil leaves."],
    nutrition: { protein: "38g", carbs: "12g", fat: "18g", fiber: "1g" }
  },
  {
    id: 'fallback-3', title: "Honey Garlic Glazed Salmon", cuisine: "Seafood", time: 25,
    servings: 2, difficulty: "Easy", calories: 450, rating: 4.9,
    tags: ["salmon", "high-protein", "healthy", "keto-friendly"], emoji: "🐟",
    description: "Pan-seared crispy salmon fillets coated in a luscious honey, garlic, soy, and lemon reduction.",
    ingredients: ["2 salmon fillets", "3 tbsp honey", "4 cloves minced garlic", "2 tbsp soy sauce", "1 tbsp lemon juice", "1 tbsp butter"],
    steps: ["Season salmon with salt and pepper.", "Sear skin-side down for 4 mins.", "Add honey, garlic, soy, and lemon to pan.", "Baste salmon until glossy and caramelized."],
    nutrition: { protein: "42g", carbs: "18g", fat: "22g", fiber: "0g" }
  },
  {
    id: 'fallback-4', title: "Authentic Butter Chicken", cuisine: "Indian", time: 35,
    servings: 4, difficulty: "Medium", calories: 520, rating: 4.9,
    tags: ["curry", "chicken", "rich", "comfort-food"], emoji: "🍛",
    description: "Tender spiced chicken simmered in a velvety, mildly spiced aromatic tomato-cashew cream gravy.",
    ingredients: ["600g chicken breast", "1 cup tomato puree", "100ml heavy cream", "2 tbsp butter", "1 tbsp garam masala", "1 tbsp ginger garlic paste"],
    steps: ["Marinate chicken in yogurt and spices.", "Pan-sear chicken chunks.", "Simmer spiced tomato puree and cashews.", "Blend, add cream, butter, and chicken."],
    nutrition: { protein: "44g", carbs: "16g", fat: "28g", fiber: "4g" }
  },
  {
    id: 'fallback-5', title: "Avocado & Mango Salad", cuisine: "Mexican", time: 15,
    servings: 2, difficulty: "Easy", calories: 280, rating: 4.7,
    tags: ["vegan", "salad", "healthy", "summer", "gluten-free"], emoji: "🥑",
    description: "Vibrant tropical bowl loaded with creamy avocado, sweet diced mango, lime zest, and cilantro.",
    ingredients: ["2 ripe avocados", "1 fresh mango", "1/2 red onion", "1 lime juiced", "Handful cilantro", "1 jalapeño diced", "Sea salt"],
    steps: ["Dice avocado and mango.", "Chop red onion, cilantro, and jalapeño.", "Combine in a bowl.", "Toss with fresh lime juice and olive oil."],
    nutrition: { protein: "4g", carbs: "32g", fat: "22g", fiber: "8g" }
  },
  {
    id: 'fallback-6', title: "Classic Margherita Pizza", cuisine: "Italian", time: 25,
    servings: 3, difficulty: "Easy", calories: 390, rating: 4.8,
    tags: ["pizza", "vegetarian", "cheese", "italian"], emoji: "🍕",
    description: "Traditional Neapolitan thin-crust pizza topped with San Marzano tomatoes, fresh mozzarella, and basil.",
    ingredients: ["1 pizza dough ball", "1/2 cup tomato passata", "150g fresh mozzarella", "Fresh basil leaves", "1 tbsp extra virgin olive oil"],
    steps: ["Stretch pizza dough into round base.", "Spread seasoned tomato passata.", "Tear mozzarella evenly.", "Bake at 250°C (480°F) for 10-12 mins until blistered."],
    nutrition: { protein: "18g", carbs: "48g", fat: "14g", fiber: "3g" }
  },
  {
    id: 'fallback-7', title: "Smoked Black Bean Tacos", cuisine: "Mexican", time: 20,
    servings: 3, difficulty: "Easy", calories: 340, rating: 4.7,
    tags: ["tacos", "vegetarian", "fiber-rich", "mexican"], emoji: "🌮",
    description: "Warm corn tortillas stuffed with seasoned black beans, charred corn, chipotle salsa, and cotija cheese.",
    ingredients: ["6 corn tortillas", "1 can black beans", "1/2 cup sweet corn", "1 tsp smoked paprika", "1/2 avocado", "40g cotija cheese"],
    steps: ["Sauté black beans with cumin and smoked paprika.", "Char corn in skillet.", "Warm corn tortillas.", "Assemble tacos with salsa and cotija cheese."],
    nutrition: { protein: "14g", carbs: "52g", fat: "10g", fiber: "11g" }
  },
  {
    id: 'fallback-8', title: "Wild Mushroom Risotto", cuisine: "Italian", time: 35,
    servings: 4, difficulty: "Medium", calories: 440, rating: 4.9,
    tags: ["risotto", "vegetarian", "gourmet", "creamy"], emoji: "🍄",
    description: "Creamy Arborio rice slowly simmered with rich vegetable stock, porcini mushrooms, parmesan, and thyme.",
    ingredients: ["300g Arborio rice", "250g mixed wild mushrooms", "1 liter hot vegetable stock", "50g parmesan", "2 shallots", "2 tbsp butter"],
    steps: ["Sauté mushrooms and set aside.", "Sweat shallots, toast arborio rice.", "Add hot broth ladle by ladle stirring continuously.", "Fold in butter, parmesan, and sautéed mushrooms."],
    nutrition: { protein: "12g", carbs: "68g", fat: "12g", fiber: "4g" }
  }
]

export function RecipeProvider({ children }) {
  const [generatedRecipes, setGeneratedRecipes] = useState([])
  const [savedRecipes, setSavedRecipes] = useState([])
  const [popularRecipes, setPopularRecipes] = useState(FALLBACK_RECIPES)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeRecipe, setActiveRecipe] = useState(null)
  const [apiError, setApiError] = useState(null)

  // ── Lookup state ───────────────────────────────────────────────────────────
  const [lookupResult, setLookupResult] = useState(null)
  const [isLooking, setIsLooking] = useState(false)
  const [lookupError, setLookupError] = useState(null)


  // ── Load popular recipes on mount ──────────────────────────────────────────
  useEffect(() => {
    fetchPopularRecipes()
    fetchSavedRecipes()
  }, [])

  const fetchPopularRecipes = async () => {
    try {
      const res = await fetch(`${API_BASE}/recipes/popular/`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.recipes?.length > 0) {
        setPopularRecipes(data.recipes)
      }
    } catch (err) {
      console.warn('Could not fetch popular recipes from API, using fallback.', err.message)
    }
  }

  const fetchSavedRecipes = async () => {
    let apiRecipes = []
    try {
      const res = await fetch(`${API_BASE}/recipes/saved/`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        apiRecipes = (data.saved_recipes || []).map(s => ({
          ...s.recipe,
          savedEntryId: s.id,
        }))
      }
    } catch (err) {
      console.warn('Could not fetch saved recipes from API.', err.message)
    }

    try {
      const localSaved = JSON.parse(localStorage.getItem('recipe_ai_saved') || '[]')
      if (Array.isArray(localSaved) && localSaved.length > 0) {
        const apiKeys = new Set(apiRecipes.map(r => r.id || r.title))
        const localOnly = localSaved.filter(r => !apiKeys.has(r.id || r.title))
        setSavedRecipes([...apiRecipes, ...localOnly])
        return
      }
    } catch {}

    setSavedRecipes(apiRecipes)
  }

  // ── Generate Recipes ────────────────────────────────────────────────────────
  const generateRecipes = async (params) => {
    setIsGenerating(true)
    setGeneratedRecipes([])
    setApiError(null)

    try {
      const res = await fetch(`${API_BASE}/recipes/generate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setGeneratedRecipes(data.recipes || [])
    } catch (err) {
      console.error('Generation error:', err.message)
      setApiError(err.message)
      setGeneratedRecipes([])
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Save / Unsave ───────────────────────────────────────────────────────────
  const saveRecipe = async (recipe) => {
    if (!recipe) return
    const recipeObj = {
      ...recipe,
      id: recipe.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'recipe-' + Date.now()),
      tags: Array.isArray(recipe.tags) ? recipe.tags : [],
      rating: recipe.rating || 4.8,
    }

    // For recipes from API (have numeric id), save via API
    if (typeof recipeObj.id === 'number') {
      try {
        const res = await fetch(`${API_BASE}/recipes/saved/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ recipe_id: recipeObj.id }),
        })
        const data = await res.json()
        // Toggle locally based on server response
        if (data.saved === false) {
          setSavedRecipes(prev => {
            const next = prev.filter(r => r.id !== recipeObj.id && r.title !== recipeObj.title)
            try { localStorage.setItem('recipe_ai_saved', JSON.stringify(next)) } catch {}
            return next
          })
        } else {
          setSavedRecipes(prev => {
            if (prev.find(r => r.id === recipeObj.id)) return prev
            const next = [...prev, { ...data.recipe, savedEntryId: null }]
            try { localStorage.setItem('recipe_ai_saved', JSON.stringify(next)) } catch {}
            return next
          })
        }
        return
      } catch (err) {
        console.warn('API save failed, falling back to local toggle.', err.message)
      }
    }

    // For freshly generated recipes (string uuid ids), manage locally and in localStorage
    setSavedRecipes(prev => {
      const alreadySaved = prev.some(
        r => r.id === recipeObj.id || (r.title && recipeObj.title && r.title.toLowerCase() === recipeObj.title.toLowerCase())
      )
      let next
      if (alreadySaved) {
        next = prev.filter(
          r => r.id !== recipeObj.id && (!recipeObj.title || r.title?.toLowerCase() !== recipeObj.title.toLowerCase())
        )
      } else {
        next = [...prev, recipeObj]
      }
      try { localStorage.setItem('recipe_ai_saved', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const isSaved = (id, title) => {
    if (!id && !title) return false
    return savedRecipes.some(
      r => (id && r.id === id) ||
           (title && r.title && r.title.toLowerCase() === title.toLowerCase()) ||
           (r.id && r.id === title)
    )
  }

  // ── Recipe Name Lookup ─────────────────────────────────────────────────────
  const lookupRecipe = async (name, filters = {}) => {
    setIsLooking(true)
    setLookupResult(null)
    setLookupError(null)

    try {
      const res = await fetch(`${API_BASE}/recipes/lookup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, filters }),
      })
      const data = await res.json()
      if (!res.ok || !data.found) {
        setLookupError(data.message || `No recipe found for "${name}".`)
      } else {
        setLookupResult(data.recipe)
      }
    } catch (err) {
      setLookupError('Could not reach the server. Make sure the backend is running.')
    } finally {
      setIsLooking(false)
    }
  }

  const clearLookup = () => {
    setLookupResult(null)
    setLookupError(null)
  }

  return (
    <RecipeContext.Provider value={{
      generatedRecipes,
      savedRecipes,
      popularRecipes,
      isGenerating,
      activeRecipe,
      apiError,
      // Lookup
      lookupResult,
      isLooking,
      lookupError,
      lookupRecipe,
      clearLookup,
      generateRecipes,
      saveRecipe,
      isSaved,
      setActiveRecipe,
      MOCK_RECIPES: popularRecipes,
    }}>
      {children}
    </RecipeContext.Provider>
  )
}

export const useRecipe = () => useContext(RecipeContext)
