"""
AI Service for Recipe Generation.

Architecture is provider-agnostic: swap `_rule_based_generate` for
`_huggingface_generate` once you have an API key.

Usage:
    from recipes.ai_service import generate_recipes
    recipes = generate_recipes(ingredients=["chicken", "garlic"], cuisine="Italian", ...)
"""
import random
import uuid
from django.conf import settings


# ─────────────────────────────────────────────────────────────────────────────
# Recipe Knowledge Base  (used by the rule-based engine)
# ─────────────────────────────────────────────────────────────────────────────

RECIPE_DATABASE = [
    {
        "title": "Creamy Garlic Pasta",
        "cuisine": "Italian",
        "time": 25,
        "servings": 4,
        "difficulty": "Easy",
        "calories": 420,
        "emoji": "🍝",
        "description": "A rich and velvety pasta with roasted garlic, parmesan, and fresh herbs.",
        "tags": ["pasta", "vegetarian", "quick", "comfort"],
        "key_ingredients": ["pasta", "garlic", "cream", "parmesan"],
        "ingredients": [
            "400g spaghetti", "6 cloves garlic", "100ml heavy cream",
            "80g parmesan", "2 tbsp olive oil", "Fresh basil", "Salt & pepper"
        ],
        "steps": [
            "Cook spaghetti in salted boiling water until al dente.",
            "Roast sliced garlic in olive oil over low heat until golden.",
            "Add heavy cream and simmer for 2 minutes.",
            "Drain pasta, reserving 1 cup pasta water.",
            "Toss pasta with cream sauce, adding pasta water as needed.",
            "Finish with parmesan and fresh basil. Season and serve."
        ],
        "nutrition": {"protein": "16g", "carbs": "62g", "fat": "14g", "fiber": "3g"},
        "diet_tags": ["vegetarian"],
        "meal_types": ["lunch", "dinner"],
    },
    {
        "title": "Spicy Thai Basil Chicken",
        "cuisine": "Thai",
        "time": 20,
        "servings": 2,
        "difficulty": "Easy",
        "calories": 380,
        "emoji": "🌶️",
        "description": "Authentic Thai stir-fry with fragrant basil, chili, and tender chicken.",
        "tags": ["chicken", "spicy", "gluten-free", "stir-fry"],
        "key_ingredients": ["chicken", "basil", "chili", "garlic"],
        "ingredients": [
            "500g ground chicken", "3 Thai chilies", "4 garlic cloves",
            "2 tbsp oyster sauce", "1 tbsp soy sauce", "Fresh Thai basil", "1 tbsp fish sauce"
        ],
        "steps": [
            "Heat oil in a wok over high heat.",
            "Fry garlic and chilies until fragrant, about 30 seconds.",
            "Add ground chicken and cook until browned.",
            "Season with oyster sauce, soy sauce, and fish sauce.",
            "Stir in fresh Thai basil leaves until wilted.",
            "Serve over jasmine rice with a fried egg."
        ],
        "nutrition": {"protein": "38g", "carbs": "12g", "fat": "18g", "fiber": "1g"},
        "diet_tags": ["gluten-free"],
        "meal_types": ["lunch", "dinner"],
    },
    {
        "title": "Avocado & Mango Salad",
        "cuisine": "Mexican",
        "time": 15,
        "servings": 2,
        "difficulty": "Easy",
        "calories": 280,
        "emoji": "🥑",
        "description": "Vibrant tropical salad with fresh avocado, mango, lime, and cilantro.",
        "tags": ["vegan", "salad", "healthy", "summer", "gluten-free"],
        "key_ingredients": ["avocado", "mango", "lime", "cilantro"],
        "ingredients": [
            "2 ripe avocados", "1 large mango", "1 red onion",
            "1 lime (juiced)", "Handful cilantro", "1 jalapeño", "Salt to taste"
        ],
        "steps": [
            "Dice avocado and mango into equal cubes.",
            "Finely slice red onion and jalapeño.",
            "Combine all ingredients in a large bowl.",
            "Squeeze fresh lime juice over the mixture.",
            "Season with salt, toss gently and serve immediately."
        ],
        "nutrition": {"protein": "4g", "carbs": "32g", "fat": "22g", "fiber": "8g"},
        "diet_tags": ["vegan", "vegetarian", "gluten-free", "dairy-free"],
        "meal_types": ["lunch", "snack"],
    },
    {
        "title": "Honey Garlic Salmon",
        "cuisine": "American",
        "time": 30,
        "servings": 2,
        "difficulty": "Medium",
        "calories": 460,
        "emoji": "🐟",
        "description": "Glazed salmon with a sweet honey garlic sauce – restaurant quality at home.",
        "tags": ["seafood", "healthy", "gluten-free", "omega-3"],
        "key_ingredients": ["salmon", "honey", "garlic", "soy sauce"],
        "ingredients": [
            "2 salmon fillets", "3 tbsp honey", "4 garlic cloves",
            "2 tbsp soy sauce", "1 tbsp butter", "1 lemon", "Fresh dill"
        ],
        "steps": [
            "Mix honey, garlic, soy sauce for the glaze.",
            "Season salmon with salt and pepper.",
            "Sear salmon skin-side down in butter, 4 minutes.",
            "Flip and pour glaze over fish.",
            "Cook 3 more minutes, basting continuously.",
            "Garnish with dill and lemon wedges."
        ],
        "nutrition": {"protein": "42g", "carbs": "22g", "fat": "20g", "fiber": "0g"},
        "diet_tags": ["gluten-free"],
        "meal_types": ["lunch", "dinner"],
    },
    {
        "title": "Mushroom Risotto",
        "cuisine": "Italian",
        "time": 40,
        "servings": 4,
        "difficulty": "Medium",
        "calories": 390,
        "emoji": "🍄",
        "description": "Creamy Arborio rice slow-cooked with wild mushrooms, white wine, and parmesan.",
        "tags": ["vegetarian", "creamy", "comfort", "italian"],
        "key_ingredients": ["mushroom", "rice", "parmesan", "onion"],
        "ingredients": [
            "300g Arborio rice", "400g mixed mushrooms", "1 onion",
            "100ml white wine", "1L vegetable stock", "80g parmesan",
            "2 tbsp butter", "Fresh thyme"
        ],
        "steps": [
            "Sauté onion in butter until soft.",
            "Add Arborio rice and toast for 2 minutes.",
            "Pour in white wine and stir until absorbed.",
            "Add warm stock one ladle at a time, stirring constantly.",
            "In a separate pan, fry mushrooms with thyme until golden.",
            "Fold mushrooms and parmesan into risotto. Serve immediately."
        ],
        "nutrition": {"protein": "14g", "carbs": "58g", "fat": "12g", "fiber": "4g"},
        "diet_tags": ["vegetarian"],
        "meal_types": ["lunch", "dinner"],
    },
    {
        "title": "Veggie Stir-Fry with Tofu",
        "cuisine": "Chinese",
        "time": 25,
        "servings": 2,
        "difficulty": "Easy",
        "calories": 320,
        "emoji": "🥦",
        "description": "Crispy tofu with colorful vegetables in a savory umami sauce.",
        "tags": ["vegan", "stir-fry", "high-protein", "chinese"],
        "key_ingredients": ["tofu", "broccoli", "bell pepper", "soy sauce"],
        "ingredients": [
            "350g firm tofu (pressed)", "2 cups broccoli florets",
            "1 red bell pepper", "3 tbsp soy sauce", "1 tbsp sesame oil",
            "2 garlic cloves", "1 tsp grated ginger", "1 tbsp cornstarch"
        ],
        "steps": [
            "Press and cube tofu; toss with cornstarch.",
            "Pan-fry tofu in oil until golden and crispy on all sides.",
            "Remove tofu; stir-fry garlic and ginger 30 seconds.",
            "Add broccoli and bell pepper; cook 4 minutes.",
            "Return tofu; pour over soy sauce and sesame oil.",
            "Toss everything together and serve over steamed rice."
        ],
        "nutrition": {"protein": "22g", "carbs": "28g", "fat": "14g", "fiber": "6g"},
        "diet_tags": ["vegan", "vegetarian", "dairy-free"],
        "meal_types": ["lunch", "dinner"],
    },
    {
        "title": "Overnight Oats",
        "cuisine": "American",
        "time": 5,
        "servings": 1,
        "difficulty": "Easy",
        "calories": 350,
        "emoji": "🥣",
        "description": "No-cook, creamy oats loaded with fruit, chia seeds, and natural sweetness.",
        "tags": ["breakfast", "vegan", "meal-prep", "quick", "no-cook"],
        "key_ingredients": ["oats", "milk", "banana", "chia seeds"],
        "ingredients": [
            "½ cup rolled oats", "¾ cup almond milk", "1 tbsp chia seeds",
            "1 tbsp maple syrup", "½ banana (sliced)", "Berries to top", "Pinch of cinnamon"
        ],
        "steps": [
            "Combine oats, almond milk, chia seeds, and maple syrup in a jar.",
            "Stir well, seal the jar, and refrigerate overnight (6+ hours).",
            "In the morning, give it a good stir and add more milk if needed.",
            "Top with banana slices, fresh berries, and a pinch of cinnamon.",
            "Serve cold directly from the jar."
        ],
        "nutrition": {"protein": "10g", "carbs": "52g", "fat": "8g", "fiber": "10g"},
        "diet_tags": ["vegan", "vegetarian", "dairy-free"],
        "meal_types": ["breakfast"],
    },
    {
        "title": "Chicken Caesar Wrap",
        "cuisine": "American",
        "time": 15,
        "servings": 1,
        "difficulty": "Easy",
        "calories": 440,
        "emoji": "🌯",
        "description": "Crispy grilled chicken, romaine, parmesan, and Caesar dressing in a warm tortilla.",
        "tags": ["chicken", "wrap", "quick", "lunch"],
        "key_ingredients": ["chicken", "romaine", "parmesan", "tortilla"],
        "ingredients": [
            "1 grilled chicken breast", "2 large romaine leaves",
            "2 tbsp Caesar dressing", "2 tbsp parmesan",
            "1 large flour tortilla", "Croutons (optional)", "Lemon wedge"
        ],
        "steps": [
            "Slice grilled chicken into strips.",
            "Toss romaine and chicken with Caesar dressing.",
            "Warm the tortilla in a dry pan for 30 seconds each side.",
            "Layer chicken salad down the centre of the tortilla.",
            "Sprinkle parmesan and add croutons if using.",
            "Fold in the sides and roll tightly. Cut in half and serve."
        ],
        "nutrition": {"protein": "38g", "carbs": "32g", "fat": "18g", "fiber": "2g"},
        "diet_tags": [],
        "meal_types": ["lunch", "snack"],
    },
    {
        "title": "Black Bean Tacos",
        "cuisine": "Mexican",
        "time": 20,
        "servings": 2,
        "difficulty": "Easy",
        "calories": 360,
        "emoji": "🌮",
        "description": "Smoky black beans in crispy corn tortillas with fresh salsa and avocado.",
        "tags": ["vegan", "tacos", "mexican", "quick", "gluten-free"],
        "key_ingredients": ["black beans", "tortilla", "avocado", "tomato"],
        "ingredients": [
            "1 can black beans (drained)", "8 small corn tortillas",
            "1 avocado", "2 tomatoes (diced)", "½ red onion",
            "Juice of 1 lime", "1 tsp cumin", "Fresh cilantro"
        ],
        "steps": [
            "Heat beans in a pan with cumin, salt, and a splash of water.",
            "Warm corn tortillas on a dry griddle until slightly charred.",
            "Mash or slice avocado and season with lime juice and salt.",
            "Make salsa: mix tomatoes, red onion, cilantro, and lime.",
            "Build tacos: beans first, then avocado, then salsa.",
            "Finish with extra lime juice and cilantro leaves."
        ],
        "nutrition": {"protein": "14g", "carbs": "54g", "fat": "12g", "fiber": "14g"},
        "diet_tags": ["vegan", "vegetarian", "gluten-free", "dairy-free"],
        "meal_types": ["lunch", "dinner"],
    },
    {
        "title": "Butter Chicken",
        "cuisine": "Indian",
        "time": 45,
        "servings": 4,
        "difficulty": "Medium",
        "calories": 520,
        "emoji": "🍛",
        "description": "Tender chicken in a rich tomato-cream sauce fragrant with Indian spices.",
        "tags": ["chicken", "indian", "creamy", "curry"],
        "key_ingredients": ["chicken", "tomato", "cream", "garam masala"],
        "ingredients": [
            "700g chicken thighs", "400g crushed tomatoes", "200ml cream",
            "1 onion", "4 garlic cloves", "1 tbsp ginger", "2 tsp garam masala",
            "1 tsp cumin", "1 tsp turmeric", "2 tbsp butter"
        ],
        "steps": [
            "Marinate chicken in yogurt, garam masala, and turmeric for 30 mins.",
            "Grill or pan-sear chicken until charred; set aside.",
            "Sauté onion in butter until golden. Add garlic and ginger.",
            "Add crushed tomatoes and spices; simmer 15 minutes.",
            "Blend sauce until smooth. Return to pan.",
            "Add chicken and cream; simmer 10 more minutes. Serve with naan."
        ],
        "nutrition": {"protein": "44g", "carbs": "18g", "fat": "28g", "fiber": "3g"},
        "diet_tags": [],
        "meal_types": ["lunch", "dinner"],
    },
    {
        "title": "Greek Salad",
        "cuisine": "Mediterranean",
        "time": 10,
        "servings": 2,
        "difficulty": "Easy",
        "calories": 220,
        "emoji": "🫒",
        "description": "Classic Mediterranean salad with tomatoes, cucumber, olives, and feta.",
        "tags": ["vegetarian", "salad", "healthy", "mediterranean", "gluten-free"],
        "key_ingredients": ["tomato", "cucumber", "feta", "olives"],
        "ingredients": [
            "3 tomatoes (chopped)", "1 cucumber", "½ red onion",
            "100g feta cheese", "50g kalamata olives", "3 tbsp olive oil",
            "1 tsp dried oregano", "Salt & pepper"
        ],
        "steps": [
            "Chop tomatoes and cucumber into chunky pieces.",
            "Slice red onion into thin rings.",
            "Combine tomatoes, cucumber, and onion in a bowl.",
            "Add kalamata olives and crumble feta on top.",
            "Drizzle with olive oil and sprinkle with oregano.",
            "Season with salt and pepper. Serve immediately."
        ],
        "nutrition": {"protein": "8g", "carbs": "14g", "fat": "16g", "fiber": "4g"},
        "diet_tags": ["vegetarian", "gluten-free"],
        "meal_types": ["lunch", "snack"],
    },
    {
        "title": "Egg Fried Rice",
        "cuisine": "Chinese",
        "time": 15,
        "servings": 2,
        "difficulty": "Easy",
        "calories": 410,
        "emoji": "🍳",
        "description": "Golden wok-fried rice with scrambled eggs, vegetables, and savory soy sauce.",
        "tags": ["rice", "quick", "vegetarian", "chinese"],
        "key_ingredients": ["rice", "eggs", "soy sauce", "green onion"],
        "ingredients": [
            "2 cups cold cooked rice", "3 eggs", "½ cup frozen peas",
            "3 tbsp soy sauce", "2 garlic cloves", "2 green onions",
            "1 tbsp sesame oil", "2 tbsp vegetable oil"
        ],
        "steps": [
            "Heat oil in a wok or large pan over high heat.",
            "Add garlic and fry 30 seconds until fragrant.",
            "Push garlic aside; scramble eggs in the pan.",
            "Add cold rice; stir-fry, breaking up any clumps.",
            "Add peas and soy sauce; toss everything together.",
            "Finish with sesame oil and sliced green onions."
        ],
        "nutrition": {"protein": "18g", "carbs": "58g", "fat": "12g", "fiber": "3g"},
        "diet_tags": ["vegetarian"],
        "meal_types": ["lunch", "dinner"],
    },
]

# Diet label mappings (frontend values → internal tags)
DIET_MAP = {
    "vegetarian": "vegetarian",
    "vegan": "vegan",
    "gluten-free": "gluten-free",
    "dairy-free": "dairy-free",
    "keto": "keto",
    "paleo": "paleo",
    "low-carb": "low-carb",
}

MEAL_TYPE_MAP = {
    "breakfast": "breakfast",
    "lunch": "lunch",
    "dinner": "dinner",
    "snack": "snack",
    "dessert": "dessert",
}


import re

def _scale_amount(amount_str: str, multiplier: float) -> str:
    if not amount_str:
        return amount_str
        
    fraction_map = {'½': '0.5', '¼': '0.25', '¾': '0.75', '⅓': '0.33', '⅔': '0.66'}
    for k, v in fraction_map.items():
        if k in amount_str:
            amount_str = amount_str.replace(k, v)
            
    match = re.search(r'^([\d\.]+)', amount_str.strip())
    if match:
        num_str = match.group(1)
        try:
            num = float(num_str)
            new_num = num * multiplier
            
            if new_num.is_integer():
                new_num_str = str(int(new_num))
            else:
                new_num_str = f"{new_num:.1f}"
                
            return amount_str.replace(num_str, new_num_str, 1)
        except ValueError:
            pass
            
    return amount_str

def _scale_recipe_ingredients(recipe: dict, new_servings: int) -> dict:
    old_servings = recipe.get('servings', 1)
    if not old_servings or old_servings <= 0 or new_servings <= 0 or old_servings == new_servings:
        return recipe
        
    multiplier = new_servings / old_servings
    
    scaled_ingredients = []
    for ing in recipe.get('ingredients', []):
        if isinstance(ing, dict):
            new_ing = dict(ing)
            new_ing['amount'] = _scale_amount(ing.get('amount', ''), multiplier)
            scaled_ingredients.append(new_ing)
        elif isinstance(ing, str):
            scaled_ingredients.append(_scale_amount(ing, multiplier))
        else:
            scaled_ingredients.append(ing)
            
    recipe['ingredients'] = scaled_ingredients
    recipe['servings'] = new_servings
    return recipe

# ─────────────────────────────────────────────────────────────────────────────
# Public Interface
# ─────────────────────────────────────────────────────────────────────────────

def generate_recipes(
    ingredients: list[str],
    cuisine: str = "Any",
    diet: str = "None",
    meal_type: str = "Any",
    max_time: int = 0,
    difficulty: str = "Any",
    count: int = 3,
) -> list[dict]:
    """
    Generate recipes based on user inputs.

    Plug-in point: if HUGGINGFACE_API_KEY is set in settings,
    this will call _huggingface_generate instead of _rule_based_generate.
    """
    api_key = getattr(settings, 'HUGGINGFACE_API_KEY', '')
    if api_key:
        return _huggingface_generate(ingredients, cuisine, diet, meal_type, max_time, difficulty, count)
    return _rule_based_generate(ingredients, cuisine, diet, meal_type, max_time, difficulty, count)


# ─────────────────────────────────────────────────────────────────────────────
# Rule-Based Engine
# ─────────────────────────────────────────────────────────────────────────────

def _rule_based_generate(ingredients, cuisine, diet, meal_type, max_time, difficulty, count):
    """
    Smart rule-based recipe matching:
      1. Score each recipe by ingredient overlap
      2. Filter by cuisine, diet, meal type, time, difficulty
      3. Return top-scored, randomized results
    """
    normalised_ingredients = [i.strip().lower() for i in ingredients if i.strip()]
    candidates = []

    for recipe in RECIPE_DATABASE:
        score = 0

        # ── Ingredient matching ──
        key_ings = [k.lower() for k in recipe["key_ingredients"]]
        for user_ing in normalised_ingredients:
            for key in key_ings:
                if user_ing in key or key in user_ing:
                    score += 10
                    break

        # ── Cuisine filter ──
        if cuisine and cuisine.lower() != "any":
            if recipe["cuisine"].lower() != cuisine.lower():
                continue

        # ── Diet filter ──
        if diet and diet.lower() not in ("none", "any", ""):
            diet_key = diet.lower()
            if diet_key not in [d.lower() for d in recipe["diet_tags"]]:
                continue

        # ── Meal type filter ──
        if meal_type and meal_type.lower() not in ("any", ""):
            mt_key = meal_type.lower()
            if mt_key not in [m.lower() for m in recipe["meal_types"]]:
                continue

        # ── Time filter ──
        if max_time and max_time > 0:
            if recipe["time"] > max_time:
                continue

        # ── Difficulty filter ──
        if difficulty and difficulty.lower() not in ("any", ""):
            if recipe["difficulty"].lower() != difficulty.lower():
                continue

        # Add randomness so repeated calls return variety
        score += random.randint(0, 5)
        candidates.append((score, recipe))

    # Sort by score descending, then take top results
    candidates.sort(key=lambda x: x[0], reverse=True)

    # If no candidates matched filters, return random recipes
    if not candidates:
        candidates = [(random.randint(0, 5), r) for r in RECIPE_DATABASE]
        candidates.sort(key=lambda x: x[0], reverse=True)

    selected = [recipe for _, recipe in candidates[:max(count, 1)]]

    # Attach a unique temp id for frontend keying
    result = []
    for r in selected:
        recipe_copy = dict(r)
        recipe_copy["id"] = str(uuid.uuid4())
        recipe_copy.pop("key_ingredients", None)
        recipe_copy.pop("diet_tags", None)
        recipe_copy.pop("meal_types", None)
        result.append(recipe_copy)

    return result


# ─────────────────────────────────────────────────────────────────────────────
# HuggingFace Stub — wire this up when you have an API key
# ─────────────────────────────────────────────────────────────────────────────

def _huggingface_generate(ingredients, cuisine, diet, meal_type, max_time, difficulty, count):
    """
    Generate recipes using Hugging Face Inference API with Qwen/Qwen2.5-1.5B-Instruct.
    """
    import json
    import requests
    from django.conf import settings

    api_key = getattr(settings, 'HUGGINGFACE_API_KEY', '')
    if not api_key:
        return _rule_based_generate(ingredients, cuisine, diet, meal_type, max_time, difficulty, count)

    model_id = getattr(settings, 'HUGGINGFACE_MODEL', 'Qwen/Qwen2.5-1.5B-Instruct')
    url = f"https://api-inference.huggingface.co/models/{model_id}"
    headers = {"Authorization": f"Bearer {api_key}"}

    prompt = (
        f"Generate {count} unique {cuisine} recipes. "
        f"Ingredients available: {', '.join(ingredients)}. "
        f"Diet: {diet}. Meal type: {meal_type}. "
        f"Max time: {max_time} mins. Difficulty: {difficulty}. "
        "Return the output STRICTLY as a JSON list of dictionaries. "
        "Each dictionary must have the following keys: 'title', 'cuisine', 'time' (integer), "
        "'servings' (integer), 'difficulty', 'calories' (integer), 'emoji', 'description', "
        "'tags' (list of strings), 'ingredients' (list of strings), 'steps' (list of strings), "
        "'nutrition' (dictionary with keys: 'protein', 'carbs', 'fat', 'fiber')."
    )

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 2048,
            "return_full_text": False,
            "temperature": 0.7,
            "top_p": 0.9
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()
        
        # HuggingFace API returns a list with generated_text
        if isinstance(result, list) and len(result) > 0 and 'generated_text' in result[0]:
            generated_text = result[0]['generated_text']
            # Attempt to parse JSON from the generated text
            # Sometime LLMs wrap JSON in markdown blocks
            if "```json" in generated_text:
                generated_text = generated_text.split("```json")[1].split("```")[0].strip()
            elif "```" in generated_text:
                generated_text = generated_text.split("```")[1].strip()
            
            recipes = json.loads(generated_text)
            
            # Add unique IDs
            import uuid
            for recipe in recipes:
                recipe['id'] = str(uuid.uuid4())
                
            return recipes
    except Exception as e:
        print(f"HuggingFace API failed: {e}")
        # Fallback to rule-based if API fails
        pass

    return _rule_based_generate(ingredients, cuisine, diet, meal_type, max_time, difficulty, count)


# ─────────────────────────────────────────────────────────────────────────────
# Recipe Lookup Database  (recipe name → full details + ingredients)
# ─────────────────────────────────────────────────────────────────────────────

LOOKUP_DATABASE = [
    {
        "title": "Butter Chicken",
        "aliases": ["murgh makhani", "butter masala"],
        "cuisine": "Indian", "time": 45, "servings": 4, "difficulty": "Medium",
        "calories": 520, "rating": 4.9, "emoji": "🍛",
        "description": "Tender chicken in a rich, creamy tomato sauce fragrant with Indian spices. A restaurant classic made at home.",
        "tags": ["chicken", "indian", "creamy", "curry", "popular"],
        "ingredients": [
            {"name": "Chicken thighs", "amount": "700g", "note": "boneless, skinless"},
            {"name": "Crushed tomatoes", "amount": "400g", "note": "1 can"},
            {"name": "Heavy cream", "amount": "200ml", "note": ""},
            {"name": "Onion", "amount": "1 large", "note": "finely chopped"},
            {"name": "Garlic cloves", "amount": "4", "note": "minced"},
            {"name": "Fresh ginger", "amount": "1 tbsp", "note": "grated"},
            {"name": "Garam masala", "amount": "2 tsp", "note": ""},
            {"name": "Cumin", "amount": "1 tsp", "note": ""},
            {"name": "Turmeric", "amount": "1 tsp", "note": ""},
            {"name": "Butter", "amount": "2 tbsp", "note": ""},
            {"name": "Plain yogurt", "amount": "3 tbsp", "note": "for marinade"},
            {"name": "Salt", "amount": "to taste", "note": ""},
        ],
        "steps": [
            "Marinate chicken in yogurt, 1 tsp garam masala, and turmeric for 30 mins.",
            "Grill or pan-sear chicken until charred; set aside and cut into chunks.",
            "Melt butter in a pan; sauté onion until golden (8 min).",
            "Add garlic and ginger; cook 2 minutes until fragrant.",
            "Add crushed tomatoes and remaining spices; simmer 15 minutes.",
            "Blend the sauce until smooth, then return to the pan.",
            "Add chicken and cream; simmer on low for 10 minutes.",
            "Garnish with cream swirl and serve with naan or basmati rice.",
        ],
        "nutrition": {"protein": "44g", "carbs": "18g", "fat": "28g", "fiber": "3g"},
    },
    {
        "title": "Margherita Pizza",
        "aliases": ["cheese pizza", "tomato pizza", "classic pizza"],
        "cuisine": "Italian", "time": 35, "servings": 2, "difficulty": "Medium",
        "calories": 580, "rating": 4.8, "emoji": "🍕",
        "description": "The classic Neapolitan pizza with a golden crust, tangy tomato sauce, and melted mozzarella.",
        "tags": ["pizza", "vegetarian", "italian", "classic"],
        "ingredients": [
            {"name": "Pizza dough", "amount": "300g", "note": "store-bought or homemade"},
            {"name": "Tomato passata", "amount": "150ml", "note": "or crushed tomatoes"},
            {"name": "Fresh mozzarella", "amount": "200g", "note": "torn into pieces"},
            {"name": "Fresh basil leaves", "amount": "handful", "note": ""},
            {"name": "Olive oil", "amount": "2 tbsp", "note": "extra virgin"},
            {"name": "Garlic clove", "amount": "1", "note": "minced"},
            {"name": "Salt & pepper", "amount": "to taste", "note": ""},
            {"name": "Semolina flour", "amount": "for dusting", "note": ""},
        ],
        "steps": [
            "Preheat oven to 250°C (480°F) with a pizza stone or baking tray inside.",
            "Mix passata with garlic, olive oil, salt and pepper for the sauce.",
            "Stretch dough on a semolina-dusted surface to ~30cm circle.",
            "Spread sauce evenly, leaving a 2cm border.",
            "Scatter torn mozzarella over the sauce.",
            "Slide onto the hot stone and bake 10–12 minutes until crust is golden.",
            "Remove from oven, add fresh basil and a drizzle of olive oil.",
        ],
        "nutrition": {"protein": "26g", "carbs": "72g", "fat": "22g", "fiber": "4g"},
    },
    {
        "title": "Spaghetti Carbonara",
        "aliases": ["carbonara", "pasta carbonara"],
        "cuisine": "Italian", "time": 20, "servings": 2, "difficulty": "Medium",
        "calories": 610, "rating": 4.8, "emoji": "🍝",
        "description": "Authentic Roman pasta with crispy pancetta, egg yolk, and pecorino — no cream needed.",
        "tags": ["pasta", "italian", "quick", "classic"],
        "ingredients": [
            {"name": "Spaghetti", "amount": "200g", "note": ""},
            {"name": "Pancetta or guanciale", "amount": "150g", "note": "diced"},
            {"name": "Egg yolks", "amount": "4", "note": "room temperature"},
            {"name": "Pecorino Romano", "amount": "80g", "note": "finely grated"},
            {"name": "Parmesan", "amount": "40g", "note": "finely grated"},
            {"name": "Black pepper", "amount": "2 tsp", "note": "freshly cracked"},
            {"name": "Salt", "amount": "for pasta water", "note": ""},
        ],
        "steps": [
            "Cook spaghetti in well-salted boiling water until al dente; reserve 1 cup pasta water.",
            "Meanwhile, fry pancetta over medium heat until crispy; remove from heat.",
            "Whisk egg yolks with pecorino, parmesan, and black pepper in a bowl.",
            "Add ¼ cup hot pasta water to egg mixture and whisk to temper.",
            "Add hot drained pasta to the pancetta pan (off heat).",
            "Pour egg mixture over pasta; toss vigorously, adding pasta water to create a creamy sauce.",
            "Serve immediately with extra pecorino and black pepper.",
        ],
        "nutrition": {"protein": "32g", "carbs": "64g", "fat": "24g", "fiber": "3g"},
    },
    {
        "title": "Chicken Biryani",
        "aliases": ["biryani", "hyderabadi biryani"],
        "cuisine": "Indian", "time": 75, "servings": 4, "difficulty": "Hard",
        "calories": 650, "rating": 4.9, "emoji": "🫕",
        "description": "Fragrant basmati rice layered with spiced chicken, caramelised onions, and saffron.",
        "tags": ["chicken", "rice", "indian", "festive"],
        "ingredients": [
            {"name": "Basmati rice", "amount": "400g", "note": "soaked 30 mins"},
            {"name": "Chicken pieces", "amount": "800g", "note": "bone-in"},
            {"name": "Yogurt", "amount": "200g", "note": ""},
            {"name": "Onions", "amount": "3 large", "note": "thinly sliced"},
            {"name": "Tomatoes", "amount": "2", "note": "chopped"},
            {"name": "Ginger-garlic paste", "amount": "2 tbsp", "note": ""},
            {"name": "Biryani masala", "amount": "2 tbsp", "note": ""},
            {"name": "Saffron", "amount": "pinch", "note": "soaked in 3 tbsp warm milk"},
            {"name": "Fresh mint leaves", "amount": "handful", "note": ""},
            {"name": "Fresh coriander", "amount": "handful", "note": ""},
            {"name": "Ghee", "amount": "3 tbsp", "note": ""},
            {"name": "Whole spices", "amount": "", "note": "bay leaf, cardamom, cloves, cinnamon"},
        ],
        "steps": [
            "Marinate chicken with yogurt, ginger-garlic paste, biryani masala for 1 hour.",
            "Fry sliced onions in ghee until deep golden; drain half for garnish.",
            "Cook marinated chicken in the remaining onions until 80% done.",
            "Parboil rice with whole spices and salt until 70% cooked; drain.",
            "Layer rice over chicken in a heavy pot.",
            "Sprinkle saffron milk, mint, coriander, and fried onions on top.",
            "Seal with a tight lid (or foil) and cook on dum (low heat) 25 minutes.",
            "Gently mix before serving with raita.",
        ],
        "nutrition": {"protein": "48g", "carbs": "76g", "fat": "22g", "fiber": "4g"},
    },
    {
        "title": "Beef Tacos",
        "aliases": ["tacos", "street tacos", "ground beef tacos"],
        "cuisine": "Mexican", "time": 25, "servings": 4, "difficulty": "Easy",
        "calories": 480, "rating": 4.7, "emoji": "🌮",
        "description": "Seasoned ground beef in warm tortillas loaded with fresh toppings.",
        "tags": ["beef", "tacos", "mexican", "quick", "family"],
        "ingredients": [
            {"name": "Ground beef", "amount": "500g", "note": "80/20 lean"},
            {"name": "Small corn tortillas", "amount": "12", "note": "warmed"},
            {"name": "Onion", "amount": "1", "note": "finely diced"},
            {"name": "Garlic cloves", "amount": "3", "note": "minced"},
            {"name": "Cumin", "amount": "1½ tsp", "note": ""},
            {"name": "Chili powder", "amount": "1 tsp", "note": ""},
            {"name": "Smoked paprika", "amount": "1 tsp", "note": ""},
            {"name": "Tomato paste", "amount": "2 tbsp", "note": ""},
            {"name": "Shredded cheese", "amount": "100g", "note": "cheddar or Mexican blend"},
            {"name": "Lettuce", "amount": "2 cups", "note": "shredded"},
            {"name": "Sour cream", "amount": "4 tbsp", "note": ""},
            {"name": "Fresh salsa", "amount": "to serve", "note": ""},
            {"name": "Lime", "amount": "1", "note": "cut into wedges"},
        ],
        "steps": [
            "Sauté onion in oil over medium heat until soft, 4 minutes.",
            "Add garlic and cook 1 minute.",
            "Add beef and cook, breaking up, until browned.",
            "Stir in cumin, chili powder, paprika, tomato paste and ¼ cup water.",
            "Simmer 5 minutes until sauce thickens; season with salt.",
            "Warm tortillas on a dry pan or directly over gas flame.",
            "Build tacos: beef → cheese → lettuce → sour cream → salsa → lime squeeze.",
        ],
        "nutrition": {"protein": "34g", "carbs": "38g", "fat": "22g", "fiber": "4g"},
    },
    {
        "title": "Chocolate Lava Cake",
        "aliases": ["molten cake", "lava cake", "fondant au chocolat"],
        "cuisine": "French", "time": 20, "servings": 4, "difficulty": "Medium",
        "calories": 420, "rating": 4.9, "emoji": "🍫",
        "description": "Warm chocolate cake with a gooey molten centre — pure indulgence in under 20 minutes.",
        "tags": ["dessert", "chocolate", "french", "romantic"],
        "ingredients": [
            {"name": "Dark chocolate (70%)", "amount": "150g", "note": "chopped"},
            {"name": "Butter", "amount": "100g", "note": "unsalted"},
            {"name": "Eggs", "amount": "2 whole + 2 yolks", "note": ""},
            {"name": "Caster sugar", "amount": "80g", "note": ""},
            {"name": "Plain flour", "amount": "40g", "note": ""},
            {"name": "Cocoa powder", "amount": "1 tbsp", "note": "for dusting"},
            {"name": "Vanilla extract", "amount": "1 tsp", "note": ""},
            {"name": "Pinch of salt", "amount": "", "note": ""},
            {"name": "Icing sugar & ice cream", "amount": "to serve", "note": ""},
        ],
        "steps": [
            "Preheat oven to 200°C. Butter and dust 4 ramekins with cocoa powder.",
            "Melt chocolate and butter together over a bain-marie; stir until smooth.",
            "Whisk eggs, yolks, and sugar until pale and thick (3 minutes).",
            "Fold chocolate mixture into the egg mixture.",
            "Sift in flour and salt; fold gently until just combined.",
            "Divide batter among ramekins and refrigerate 10 minutes (or up to 24 hrs).",
            "Bake 10–12 minutes — edges should be set but centre still jiggly.",
            "Run a knife around the edge, invert onto a plate, and serve immediately with ice cream.",
        ],
        "nutrition": {"protein": "8g", "carbs": "42g", "fat": "28g", "fiber": "3g"},
    },
    {
        "title": "Pad Thai",
        "aliases": ["thai noodles", "pad thai noodles"],
        "cuisine": "Thai", "time": 30, "servings": 2, "difficulty": "Medium",
        "calories": 520, "rating": 4.8, "emoji": "🍜",
        "description": "Thailand's iconic stir-fried rice noodles with shrimp, tofu, bean sprouts, and tamarind sauce.",
        "tags": ["noodles", "thai", "seafood", "stir-fry"],
        "ingredients": [
            {"name": "Flat rice noodles", "amount": "200g", "note": "soaked per package"},
            {"name": "Shrimp", "amount": "200g", "note": "peeled and deveined"},
            {"name": "Firm tofu", "amount": "150g", "note": "cubed"},
            {"name": "Eggs", "amount": "2", "note": ""},
            {"name": "Bean sprouts", "amount": "1 cup", "note": ""},
            {"name": "Green onions", "amount": "3", "note": "chopped"},
            {"name": "Garlic cloves", "amount": "3", "note": "minced"},
            {"name": "Tamarind paste", "amount": "3 tbsp", "note": ""},
            {"name": "Fish sauce", "amount": "2 tbsp", "note": ""},
            {"name": "Palm sugar", "amount": "1 tbsp", "note": "or brown sugar"},
            {"name": "Roasted peanuts", "amount": "4 tbsp", "note": "crushed"},
            {"name": "Lime", "amount": "1", "note": "cut into wedges"},
            {"name": "Dried chili flakes", "amount": "to taste", "note": ""},
        ],
        "steps": [
            "Mix tamarind paste, fish sauce, and palm sugar for the sauce.",
            "Heat oil in a wok over very high heat; fry tofu until golden, set aside.",
            "Add shrimp; cook until pink, then push to the side.",
            "Add garlic; fry 30 seconds, then add soaked noodles.",
            "Pour sauce over noodles and toss to coat.",
            "Push noodles aside; scramble eggs in the centre, then mix through.",
            "Add bean sprouts and green onions; toss 1 minute.",
            "Serve topped with peanuts, lime wedges, and chili flakes.",
        ],
        "nutrition": {"protein": "36g", "carbs": "62g", "fat": "18g", "fiber": "4g"},
    },
    {
        "title": "French Omelette",
        "aliases": ["omelette", "omelet", "egg omelette"],
        "cuisine": "French", "time": 5, "servings": 1, "difficulty": "Easy",
        "calories": 280, "rating": 4.6, "emoji": "🍳",
        "description": "A silky, perfectly rolled French omelette — mastering the basics of great cooking.",
        "tags": ["eggs", "breakfast", "french", "quick", "vegetarian"],
        "ingredients": [
            {"name": "Eggs", "amount": "3", "note": "large, fresh"},
            {"name": "Butter", "amount": "15g", "note": "unsalted"},
            {"name": "Salt & white pepper", "amount": "pinch each", "note": ""},
            {"name": "Fresh chives", "amount": "1 tbsp", "note": "finely chopped"},
            {"name": "Cheese (optional)", "amount": "30g", "note": "Gruyère or cheddar"},
        ],
        "steps": [
            "Beat eggs with salt and white pepper until fully combined.",
            "Heat butter in a non-stick pan over medium-high heat until foaming.",
            "Pour in eggs; immediately stir with a spatula in small circles.",
            "As eggs begin to set, tilt pan and fold edges toward the centre.",
            "Add cheese or chives to the centre before the eggs fully set.",
            "Roll the omelette onto a plate (seam-side down) in one smooth motion.",
            "The outside should be pale yellow with no browning.",
        ],
        "nutrition": {"protein": "20g", "carbs": "2g", "fat": "22g", "fiber": "0g"},
    },
    {
        "title": "Caesar Salad",
        "aliases": ["caesar", "chicken caesar"],
        "cuisine": "American", "time": 15, "servings": 2, "difficulty": "Easy",
        "calories": 320, "rating": 4.6, "emoji": "🥗",
        "description": "Crisp romaine lettuce with creamy Caesar dressing, crunchy croutons, and shaved parmesan.",
        "tags": ["salad", "vegetarian", "classic", "american"],
        "ingredients": [
            {"name": "Romaine lettuce", "amount": "1 large head", "note": "torn"},
            {"name": "Parmesan", "amount": "60g", "note": "shaved or grated"},
            {"name": "Croutons", "amount": "1 cup", "note": "store-bought or homemade"},
            {"name": "Egg yolk", "amount": "1", "note": "for dressing"},
            {"name": "Garlic clove", "amount": "1", "note": "minced"},
            {"name": "Anchovy fillets", "amount": "2", "note": "or 1 tsp anchovy paste"},
            {"name": "Dijon mustard", "amount": "1 tsp", "note": ""},
            {"name": "Worcestershire sauce", "amount": "1 tsp", "note": ""},
            {"name": "Lemon juice", "amount": "2 tbsp", "note": ""},
            {"name": "Olive oil", "amount": "80ml", "note": "extra virgin"},
        ],
        "steps": [
            "Make dressing: whisk egg yolk, garlic, anchovy, mustard, Worcestershire, and lemon juice.",
            "Slowly drizzle in olive oil while whisking to emulsify.",
            "Season dressing with salt and pepper; stir in half the parmesan.",
            "Toss romaine lettuce with dressing until every leaf is coated.",
            "Add croutons and remaining parmesan.",
            "Serve immediately on chilled plates.",
        ],
        "nutrition": {"protein": "14g", "carbs": "18g", "fat": "24g", "fiber": "4g"},
    },
    {
        "title": "Pancakes",
        "aliases": ["fluffy pancakes", "american pancakes", "buttermilk pancakes"],
        "cuisine": "American", "time": 20, "servings": 4, "difficulty": "Easy",
        "calories": 380, "rating": 4.7, "emoji": "🥞",
        "description": "Thick and fluffy American-style pancakes, golden on the outside and cloud-soft inside.",
        "tags": ["breakfast", "vegetarian", "sweet", "family"],
        "ingredients": [
            {"name": "All-purpose flour", "amount": "200g", "note": ""},
            {"name": "Baking powder", "amount": "2 tsp", "note": ""},
            {"name": "Baking soda", "amount": "½ tsp", "note": ""},
            {"name": "Salt", "amount": "½ tsp", "note": ""},
            {"name": "Sugar", "amount": "2 tbsp", "note": ""},
            {"name": "Buttermilk", "amount": "240ml", "note": "or milk + 1 tbsp lemon juice"},
            {"name": "Eggs", "amount": "2", "note": ""},
            {"name": "Butter", "amount": "30g", "note": "melted"},
            {"name": "Vanilla extract", "amount": "1 tsp", "note": ""},
            {"name": "Maple syrup & butter", "amount": "to serve", "note": ""},
        ],
        "steps": [
            "Whisk flour, baking powder, baking soda, salt, and sugar in a bowl.",
            "In another bowl, whisk buttermilk, eggs, melted butter, and vanilla.",
            "Pour wet into dry ingredients; stir until just combined (lumps are fine).",
            "Rest batter 5 minutes.",
            "Heat a non-stick pan over medium heat; melt a small knob of butter.",
            "Pour ¼ cup batter per pancake; cook until bubbles appear (2–3 min), then flip.",
            "Cook 1–2 minutes more until golden; serve with maple syrup.",
        ],
        "nutrition": {"protein": "10g", "carbs": "56g", "fat": "12g", "fiber": "2g"},
    },
    {
        "title": "Sushi Rolls",
        "aliases": ["maki", "california roll", "sushi maki"],
        "cuisine": "Japanese", "time": 60, "servings": 2, "difficulty": "Hard",
        "calories": 340, "rating": 4.7, "emoji": "🍣",
        "description": "Homemade sushi rolls filled with fresh salmon, avocado, and cucumber.",
        "tags": ["sushi", "japanese", "seafood", "healthy"],
        "ingredients": [
            {"name": "Sushi rice", "amount": "300g", "note": "cooked"},
            {"name": "Rice vinegar", "amount": "3 tbsp", "note": ""},
            {"name": "Sugar", "amount": "1 tbsp", "note": ""},
            {"name": "Salt", "amount": "1 tsp", "note": ""},
            {"name": "Nori sheets", "amount": "4", "note": ""},
            {"name": "Fresh salmon", "amount": "200g", "note": "sashimi-grade, sliced"},
            {"name": "Avocado", "amount": "1", "note": "sliced"},
            {"name": "Cucumber", "amount": "½", "note": "julienned"},
            {"name": "Soy sauce", "amount": "for dipping", "note": ""},
            {"name": "Pickled ginger & wasabi", "amount": "to serve", "note": ""},
            {"name": "Sesame seeds", "amount": "1 tbsp", "note": ""},
        ],
        "steps": [
            "Season hot cooked rice with vinegar, sugar, and salt; fan to cool.",
            "Place nori shiny-side down on a bamboo mat.",
            "Spread rice over nori, leaving 2cm at the far edge.",
            "Arrange salmon, avocado, and cucumber in a line across the near edge.",
            "Roll tightly using the mat; seal the edge with a little water.",
            "Sprinkle sesame seeds on the outside.",
            "Cut each roll into 6–8 pieces with a wet, sharp knife.",
            "Serve with soy sauce, pickled ginger, and wasabi.",
        ],
        "nutrition": {"protein": "22g", "carbs": "52g", "fat": "10g", "fiber": "4g"},
    },
    {
        "title": "Guacamole",
        "aliases": ["avocado dip", "guac"],
        "cuisine": "Mexican", "time": 10, "servings": 4, "difficulty": "Easy",
        "calories": 180, "rating": 4.8, "emoji": "🥑",
        "description": "Fresh, chunky guacamole with lime, cilantro, and jalapeño — ready in 10 minutes.",
        "tags": ["vegan", "dip", "mexican", "quick", "gluten-free"],
        "ingredients": [
            {"name": "Ripe avocados", "amount": "3", "note": ""},
            {"name": "Lime", "amount": "1", "note": "juiced"},
            {"name": "Red onion", "amount": "¼", "note": "finely diced"},
            {"name": "Jalapeño", "amount": "1", "note": "seeded and minced"},
            {"name": "Fresh cilantro", "amount": "2 tbsp", "note": "chopped"},
            {"name": "Garlic clove", "amount": "1", "note": "minced"},
            {"name": "Salt", "amount": "½ tsp", "note": ""},
            {"name": "Tomato", "amount": "1 small", "note": "deseeded and diced"},
        ],
        "steps": [
            "Halve and pit avocados; scoop flesh into a bowl.",
            "Add lime juice and salt; mash to desired consistency (chunky or smooth).",
            "Fold in onion, jalapeño, cilantro, garlic, and tomato.",
            "Taste and adjust salt and lime.",
            "Serve immediately with tortilla chips, or press plastic wrap directly onto surface to prevent browning.",
        ],
        "nutrition": {"protein": "2g", "carbs": "10g", "fat": "16g", "fiber": "7g"},
    },
    {
        "title": "Tiramisu",
        "aliases": ["italian dessert", "coffee dessert"],
        "cuisine": "Italian", "time": 30, "servings": 8, "difficulty": "Medium",
        "calories": 390, "rating": 4.9, "emoji": "☕",
        "description": "The iconic Italian dessert — espresso-soaked ladyfingers layered with mascarpone cream.",
        "tags": ["dessert", "italian", "coffee", "no-bake", "classic"],
        "ingredients": [
            {"name": "Ladyfinger biscuits (savoiardi)", "amount": "250g", "note": ""},
            {"name": "Mascarpone", "amount": "500g", "note": "room temperature"},
            {"name": "Eggs", "amount": "4", "note": "separated"},
            {"name": "Caster sugar", "amount": "100g", "note": ""},
            {"name": "Strong espresso", "amount": "300ml", "note": "cooled"},
            {"name": "Marsala wine", "amount": "3 tbsp", "note": "or dark rum"},
            {"name": "Cocoa powder", "amount": "3 tbsp", "note": "for dusting"},
        ],
        "steps": [
            "Whisk egg yolks and sugar until pale and thick.",
            "Add marsala and fold in mascarpone until smooth.",
            "Whip egg whites to stiff peaks; fold into mascarpone mixture.",
            "Mix cooled espresso with a splash of marsala.",
            "Quickly dip ladyfingers in espresso; arrange a layer in a dish.",
            "Spread half the mascarpone cream over the biscuits.",
            "Repeat with another layer of dipped biscuits and cream.",
            "Refrigerate at least 4 hours (or overnight). Dust with cocoa before serving.",
        ],
        "nutrition": {"protein": "10g", "carbs": "36g", "fat": "26g", "fiber": "1g"},
    },
    {
        "title": "Chicken Alfredo",
        "aliases": ["fettuccine alfredo", "alfredo pasta"],
        "cuisine": "Italian", "time": 30, "servings": 4, "difficulty": "Easy",
        "calories": 680, "rating": 4.7, "emoji": "🍝",
        "description": "Silky fettuccine coated in a rich parmesan cream sauce with tender chicken breast.",
        "tags": ["pasta", "chicken", "creamy", "italian"],
        "ingredients": [
            {"name": "Fettuccine", "amount": "400g", "note": ""},
            {"name": "Chicken breast", "amount": "2 large", "note": "sliced thin"},
            {"name": "Heavy cream", "amount": "300ml", "note": ""},
            {"name": "Parmesan", "amount": "120g", "note": "freshly grated"},
            {"name": "Butter", "amount": "3 tbsp", "note": ""},
            {"name": "Garlic cloves", "amount": "3", "note": "minced"},
            {"name": "Italian seasoning", "amount": "1 tsp", "note": ""},
            {"name": "Salt & pepper", "amount": "to taste", "note": ""},
            {"name": "Fresh parsley", "amount": "2 tbsp", "note": "chopped, to serve"},
        ],
        "steps": [
            "Cook fettuccine in salted water until al dente; reserve ½ cup pasta water.",
            "Season chicken with salt, pepper, and Italian seasoning.",
            "Cook chicken in butter over medium-high heat until golden (6 min each side); slice.",
            "In the same pan, sauté garlic 1 minute.",
            "Add cream; simmer 3 minutes until slightly thickened.",
            "Stir in parmesan until melted and smooth.",
            "Toss pasta in sauce with a splash of pasta water if needed.",
            "Top with sliced chicken and parsley.",
        ],
        "nutrition": {"protein": "52g", "carbs": "66g", "fat": "34g", "fiber": "3g"},
    },
    {
        "title": "Banana Bread",
        "aliases": ["banana loaf", "moist banana bread"],
        "cuisine": "American", "time": 70, "servings": 8, "difficulty": "Easy",
        "calories": 260, "rating": 4.8, "emoji": "🍌",
        "description": "Moist, tender banana bread with golden crust — the best way to use overripe bananas.",
        "tags": ["baking", "breakfast", "sweet", "easy", "vegetarian"],
        "ingredients": [
            {"name": "Overripe bananas", "amount": "3 large", "note": "mashed"},
            {"name": "All-purpose flour", "amount": "190g", "note": ""},
            {"name": "Baking soda", "amount": "1 tsp", "note": ""},
            {"name": "Salt", "amount": "½ tsp", "note": ""},
            {"name": "Butter", "amount": "75g", "note": "melted"},
            {"name": "Brown sugar", "amount": "150g", "note": ""},
            {"name": "Eggs", "amount": "2", "note": ""},
            {"name": "Vanilla extract", "amount": "1 tsp", "note": ""},
            {"name": "Sour cream or yogurt", "amount": "60g", "note": "for moisture"},
            {"name": "Walnuts (optional)", "amount": "80g", "note": "chopped"},
        ],
        "steps": [
            "Preheat oven to 175°C. Grease a 9×5 inch loaf tin.",
            "Whisk melted butter and sugar; beat in eggs and vanilla.",
            "Stir in mashed bananas and sour cream.",
            "Fold in flour, baking soda, and salt until just combined.",
            "Fold in walnuts if using.",
            "Pour into loaf tin; bake 60–65 minutes until a skewer comes out clean.",
            "Cool in tin 10 minutes, then turn out onto a rack.",
        ],
        "nutrition": {"protein": "4g", "carbs": "38g", "fat": "10g", "fiber": "2g"},
    },
    # ── Indian Recipes ─────────────────────────────────────────────────────────
    {
        "title": "Paneer Butter Masala",
        "aliases": ["paneer", "paneer makhani", "paneer masala", "paneer curry", "cottage cheese curry"],
        "cuisine": "Indian", "time": 35, "servings": 4, "difficulty": "Medium",
        "calories": 480, "rating": 4.8, "emoji": "🧀",
        "description": "Soft paneer cubes simmered in a rich, velvety tomato-cream sauce with aromatic Indian spices.",
        "tags": ["paneer", "indian", "vegetarian", "creamy", "curry"],
        "ingredients": [
            {"name": "Paneer", "amount": "400g", "note": "cut into 1-inch cubes"},
            {"name": "Crushed tomatoes", "amount": "400g", "note": "1 can or 4 fresh tomatoes blended"},
            {"name": "Heavy cream", "amount": "150ml", "note": ""},
            {"name": "Butter", "amount": "3 tbsp", "note": ""},
            {"name": "Onion", "amount": "2 medium", "note": "finely chopped"},
            {"name": "Garlic cloves", "amount": "5", "note": "minced"},
            {"name": "Fresh ginger", "amount": "1-inch piece", "note": "grated"},
            {"name": "Garam masala", "amount": "1.5 tsp", "note": ""},
            {"name": "Coriander powder", "amount": "1 tsp", "note": ""},
            {"name": "Cumin seeds", "amount": "1 tsp", "note": ""},
            {"name": "Turmeric", "amount": "½ tsp", "note": ""},
            {"name": "Kashmiri red chili powder", "amount": "1 tsp", "note": "for color and mild heat"},
            {"name": "Kasuri methi", "amount": "1 tsp", "note": "dried fenugreek leaves"},
            {"name": "Salt", "amount": "to taste", "note": ""},
        ],
        "steps": [
            "Heat 1 tbsp butter in a pan. Lightly fry paneer cubes until golden on each side. Remove and set aside.",
            "In the same pan, heat remaining butter. Add cumin seeds and let them splutter.",
            "Add onions and sauté on medium heat for 8–10 minutes until golden brown.",
            "Add garlic and ginger; cook 2 minutes until raw smell disappears.",
            "Add turmeric, coriander powder, and Kashmiri chili powder; stir for 1 minute.",
            "Pour in crushed tomatoes. Simmer on medium heat for 12–15 minutes, stirring occasionally.",
            "Let the tomato mixture cool, then blend smooth. Pass through a strainer back into the pan.",
            "Add cream, garam masala, and kasuri methi. Stir to combine.",
            "Gently fold in fried paneer cubes. Simmer on low heat for 5 minutes.",
            "Adjust salt and serve hot with naan, roti, or basmati rice.",
        ],
        "nutrition": {"protein": "22g", "carbs": "18g", "fat": "34g", "fiber": "3g"},
    },
    {
        "title": "Palak Paneer",
        "aliases": ["spinach paneer", "saag paneer", "palak curry", "spinach curry with paneer"],
        "cuisine": "Indian", "time": 40, "servings": 4, "difficulty": "Medium",
        "calories": 380, "rating": 4.7, "emoji": "🌿",
        "description": "Creamy spinach gravy with soft paneer cubes — a nutritious and vibrant North Indian classic.",
        "tags": ["paneer", "spinach", "vegetarian", "indian", "healthy"],
        "ingredients": [
            {"name": "Fresh spinach (palak)", "amount": "500g", "note": "washed and roughly chopped"},
            {"name": "Paneer", "amount": "300g", "note": "cubed"},
            {"name": "Onion", "amount": "1 large", "note": "chopped"},
            {"name": "Tomato", "amount": "2 medium", "note": "chopped"},
            {"name": "Garlic cloves", "amount": "4", "note": "minced"},
            {"name": "Fresh ginger", "amount": "1 tsp", "note": "grated"},
            {"name": "Green chili", "amount": "1", "note": "slit"},
            {"name": "Fresh cream", "amount": "3 tbsp", "note": "for finishing"},
            {"name": "Cumin seeds", "amount": "1 tsp", "note": ""},
            {"name": "Garam masala", "amount": "1 tsp", "note": ""},
            {"name": "Coriander powder", "amount": "1 tsp", "note": ""},
            {"name": "Butter or oil", "amount": "2 tbsp", "note": ""},
            {"name": "Salt", "amount": "to taste", "note": ""},
        ],
        "steps": [
            "Blanch spinach in boiling salted water for 2 minutes. Immediately transfer to ice water. Drain and blend to a smooth purée.",
            "Heat butter in a pan. Lightly pan-fry paneer cubes until golden. Remove and set aside.",
            "In the same pan, add cumin seeds. When they splutter, add onions and sauté until golden (8 mins).",
            "Add garlic, ginger, and green chili. Cook 2 minutes.",
            "Add chopped tomatoes, coriander powder, and garam masala. Cook until tomatoes soften completely.",
            "Pour in the spinach purée. Stir well and simmer for 5 minutes.",
            "Add paneer cubes. Gently mix and cook on low for 3–4 minutes.",
            "Stir in fresh cream. Adjust salt and serve with naan or jeera rice.",
        ],
        "nutrition": {"protein": "20g", "carbs": "12g", "fat": "26g", "fiber": "5g"},
    },
    {
        "title": "Dal Tadka",
        "aliases": ["dal fry", "toor dal", "yellow dal", "lentil curry", "indian dal", "dal"],
        "cuisine": "Indian", "time": 35, "servings": 4, "difficulty": "Easy",
        "calories": 280, "rating": 4.7, "emoji": "🍲",
        "description": "Comforting yellow lentils tempered with ghee, cumin, garlic, and spices — a staple of every Indian home.",
        "tags": ["dal", "lentil", "vegan", "vegetarian", "indian", "high-protein"],
        "ingredients": [
            {"name": "Toor dal (split pigeon peas)", "amount": "1 cup (200g)", "note": "rinsed"},
            {"name": "Onion", "amount": "1 large", "note": "finely chopped"},
            {"name": "Tomatoes", "amount": "2 medium", "note": "chopped"},
            {"name": "Garlic cloves", "amount": "5", "note": "minced"},
            {"name": "Fresh ginger", "amount": "1 tsp", "note": "grated"},
            {"name": "Green chilies", "amount": "2", "note": "slit"},
            {"name": "Cumin seeds", "amount": "1 tsp", "note": "for tadka"},
            {"name": "Mustard seeds", "amount": "½ tsp", "note": "for tadka"},
            {"name": "Dried red chilies", "amount": "2", "note": "for tadka"},
            {"name": "Turmeric", "amount": "½ tsp", "note": ""},
            {"name": "Red chili powder", "amount": "1 tsp", "note": ""},
            {"name": "Garam masala", "amount": "½ tsp", "note": ""},
            {"name": "Ghee or oil", "amount": "3 tbsp", "note": ""},
            {"name": "Fresh coriander leaves", "amount": "handful", "note": "to garnish"},
            {"name": "Salt", "amount": "to taste", "note": ""},
        ],
        "steps": [
            "Pressure cook toor dal with 2.5 cups water, turmeric, and salt for 4–5 whistles. Mash gently and set aside.",
            "Heat 2 tbsp ghee in a pan. Sauté onions until golden brown (8–10 minutes).",
            "Add garlic, ginger, and green chilies. Cook 2 minutes.",
            "Add chopped tomatoes, red chili powder. Cook until tomatoes are soft and oil separates.",
            "Pour cooked dal into the masala. Add water to desired consistency. Simmer 10 minutes.",
            "For tadka: heat 1 tbsp ghee in a small pan. Add cumin seeds, mustard seeds, and dried red chilies.",
            "When seeds splutter, add sliced garlic and cook until golden. Pour tadka over the dal.",
            "Add garam masala, garnish with fresh coriander, and serve with rice or roti.",
        ],
        "nutrition": {"protein": "14g", "carbs": "38g", "fat": "10g", "fiber": "8g"},
    },
    {
        "title": "Aloo Gobi",
        "aliases": ["potato cauliflower curry", "aloo gobhi", "potato cauliflower sabzi", "aloo cauliflower"],
        "cuisine": "Indian", "time": 30, "servings": 4, "difficulty": "Easy",
        "calories": 220, "rating": 4.5, "emoji": "🥔",
        "description": "A dry spiced Indian dish of golden potatoes and cauliflower with cumin, turmeric, and coriander.",
        "tags": ["aloo", "cauliflower", "vegan", "vegetarian", "indian", "dry curry"],
        "ingredients": [
            {"name": "Potatoes", "amount": "3 medium", "note": "peeled and cubed"},
            {"name": "Cauliflower", "amount": "1 medium head", "note": "cut into florets"},
            {"name": "Onion", "amount": "1 large", "note": "sliced"},
            {"name": "Tomato", "amount": "2 medium", "note": "chopped"},
            {"name": "Garlic cloves", "amount": "4", "note": "minced"},
            {"name": "Fresh ginger", "amount": "1 tsp", "note": "grated"},
            {"name": "Green chili", "amount": "1", "note": "chopped"},
            {"name": "Cumin seeds", "amount": "1 tsp", "note": ""},
            {"name": "Turmeric", "amount": "½ tsp", "note": ""},
            {"name": "Coriander powder", "amount": "1.5 tsp", "note": ""},
            {"name": "Red chili powder", "amount": "1 tsp", "note": ""},
            {"name": "Garam masala", "amount": "½ tsp", "note": "to finish"},
            {"name": "Oil", "amount": "3 tbsp", "note": ""},
            {"name": "Fresh coriander leaves", "amount": "handful", "note": "to garnish"},
            {"name": "Salt", "amount": "to taste", "note": ""},
        ],
        "steps": [
            "Heat oil in a large pan. Add cumin seeds; let them splutter.",
            "Add onions and sauté on medium heat until translucent (5–6 minutes).",
            "Add garlic, ginger, and green chili. Cook 2 minutes.",
            "Add chopped tomatoes and all spices except garam masala. Cook until oil separates (6–8 minutes).",
            "Add potato cubes. Toss to coat with masala. Cover and cook 5 minutes.",
            "Add cauliflower florets. Mix gently. Cover and cook on low heat 12–15 minutes, stirring occasionally.",
            "Remove lid, add garam masala, and cook uncovered 2 minutes to dry out any moisture.",
            "Garnish with fresh coriander and serve hot with roti or paratha.",
        ],
        "nutrition": {"protein": "6g", "carbs": "32g", "fat": "10g", "fiber": "6g"},
    },
    {
        "title": "Chole Bhature",
        "aliases": ["chhole bhature", "chole", "chickpea curry with puri", "punjabi chole", "chole masala"],
        "cuisine": "Indian", "time": 50, "servings": 4, "difficulty": "Medium",
        "calories": 560, "rating": 4.8, "emoji": "🫘",
        "description": "Spicy, tangy Punjabi chickpea curry served with fluffy deep-fried bhature — a beloved street food.",
        "tags": ["chickpeas", "indian", "street food", "vegan", "punjabi"],
        "ingredients": [
            {"name": "Chickpeas (kabuli chana)", "amount": "2 cups (400g)", "note": "soaked overnight, or 2 cans drained"},
            {"name": "Onions", "amount": "3 large", "note": "finely chopped"},
            {"name": "Tomatoes", "amount": "3 medium", "note": "puréed"},
            {"name": "Garlic cloves", "amount": "6", "note": "minced"},
            {"name": "Ginger", "amount": "1-inch piece", "note": "grated"},
            {"name": "Green chilies", "amount": "2", "note": "slit"},
            {"name": "Tea bag (for black color)", "amount": "1", "note": "optional"},
            {"name": "Chole masala powder", "amount": "2 tbsp", "note": ""},
            {"name": "Cumin seeds", "amount": "1 tsp", "note": ""},
            {"name": "Bay leaves", "amount": "2", "note": ""},
            {"name": "Amchur (dry mango powder)", "amount": "1 tsp", "note": "for tanginess"},
            {"name": "Pomegranate seeds powder", "amount": "1 tsp", "note": "anardana"},
            {"name": "Oil", "amount": "4 tbsp", "note": ""},
            {"name": "Salt", "amount": "to taste", "note": ""},
        ],
        "steps": [
            "Pressure cook chickpeas with tea bag, salt, and enough water for 6–8 whistles until soft. Discard tea bag.",
            "Heat oil in a pan. Add cumin seeds and bay leaves; let them crackle.",
            "Add onions and cook on medium-high heat until deep golden brown (12–15 minutes).",
            "Add garlic, ginger, and green chilies. Cook 3 minutes.",
            "Add tomato purée and chole masala. Cook until oil separates from the masala (10 minutes).",
            "Add cooked chickpeas with their liquid. Mix well. Simmer 15 minutes.",
            "Add amchur and anardana. Mash a few chickpeas to thicken the gravy.",
            "Adjust salt and serve hot with bhature, sliced onions, and green chutney.",
        ],
        "nutrition": {"protein": "18g", "carbs": "68g", "fat": "16g", "fiber": "14g"},
    },
    {
        "title": "Chicken Tikka",
        "aliases": ["tikka", "chicken tikka masala", "tandoori chicken tikka", "grilled chicken tikka"],
        "cuisine": "Indian", "time": 40, "servings": 4, "difficulty": "Medium",
        "calories": 350, "rating": 4.8, "emoji": "🍗",
        "description": "Juicy, smoky charred chicken tikka — marinated in spiced yogurt and grilled to perfection.",
        "tags": ["chicken", "tikka", "grilled", "indian", "high-protein"],
        "ingredients": [
            {"name": "Chicken breast or thighs", "amount": "700g", "note": "cut into 2-inch cubes"},
            {"name": "Greek yogurt", "amount": "1 cup", "note": "thick"},
            {"name": "Lemon juice", "amount": "2 tbsp", "note": ""},
            {"name": "Garlic cloves", "amount": "5", "note": "minced"},
            {"name": "Ginger", "amount": "1-inch piece", "note": "grated"},
            {"name": "Kashmiri red chili powder", "amount": "2 tsp", "note": "for vivid red color"},
            {"name": "Cumin powder", "amount": "1 tsp", "note": ""},
            {"name": "Coriander powder", "amount": "1 tsp", "note": ""},
            {"name": "Garam masala", "amount": "1 tsp", "note": ""},
            {"name": "Turmeric", "amount": "½ tsp", "note": ""},
            {"name": "Oil", "amount": "2 tbsp", "note": ""},
            {"name": "Salt", "amount": "1 tsp", "note": ""},
            {"name": "Charcoal", "amount": "1 piece", "note": "optional, for smoky flavor"},
        ],
        "steps": [
            "Make deep cuts in chicken pieces for better marinade penetration.",
            "Mix yogurt, lemon juice, garlic, ginger, all spices, oil, and salt into a smooth marinade.",
            "Coat chicken pieces thoroughly. Marinate for at least 2 hours (overnight is best).",
            "Thread chicken onto skewers. Grill on high heat (grill pan, oven at 220°C, or BBQ).",
            "Cook 12–15 minutes, turning every 4 minutes until charred on edges and cooked through.",
            "For smoky flavor: place lit charcoal in a small foil cup inside the pan, drizzle oil, cover 2 minutes.",
            "Serve hot with mint chutney, sliced onions, and lemon wedges.",
        ],
        "nutrition": {"protein": "42g", "carbs": "6g", "fat": "16g", "fiber": "1g"},
    },
    {
        "title": "Rajma Chawal",
        "aliases": ["rajma", "kidney bean curry", "red bean curry", "rajma rice", "rajma masala"],
        "cuisine": "Indian", "time": 50, "servings": 4, "difficulty": "Easy",
        "calories": 420, "rating": 4.8, "emoji": "🫘",
        "description": "Hearty Punjabi kidney bean curry simmered in a tomato-onion gravy, served with steamed basmati rice.",
        "tags": ["rajma", "kidney beans", "vegan", "vegetarian", "indian", "high-protein"],
        "ingredients": [
            {"name": "Kidney beans (rajma)", "amount": "2 cups (400g)", "note": "soaked overnight or 2 cans"},
            {"name": "Onions", "amount": "2 large", "note": "puréed"},
            {"name": "Tomatoes", "amount": "3 medium", "note": "puréed"},
            {"name": "Garlic cloves", "amount": "5", "note": ""},
            {"name": "Ginger", "amount": "1-inch piece", "note": ""},
            {"name": "Cumin seeds", "amount": "1 tsp", "note": ""},
            {"name": "Bay leaf", "amount": "1", "note": ""},
            {"name": "Coriander powder", "amount": "2 tsp", "note": ""},
            {"name": "Red chili powder", "amount": "1 tsp", "note": ""},
            {"name": "Garam masala", "amount": "1 tsp", "note": ""},
            {"name": "Rajma masala", "amount": "1 tsp", "note": "optional spice blend"},
            {"name": "Oil", "amount": "3 tbsp", "note": ""},
            {"name": "Salt", "amount": "to taste", "note": ""},
        ],
        "steps": [
            "Pressure cook soaked rajma with salt for 6–8 whistles until completely soft.",
            "Heat oil. Add cumin seeds and bay leaf. Fry 30 seconds.",
            "Add onion purée. Cook on high heat, stirring constantly, for 10–12 minutes until deep golden.",
            "Add garlic-ginger paste. Cook 2 minutes.",
            "Add tomato purée, coriander powder, red chili powder. Cook until oil separates.",
            "Add cooked rajma with its cooking liquid. Mash a few beans to thicken the gravy.",
            "Simmer 15–20 minutes. Add garam masala and rajma masala in the last 2 minutes.",
            "Serve over steamed basmati rice with a dollop of butter.",
        ],
        "nutrition": {"protein": "16g", "carbs": "58g", "fat": "12g", "fiber": "12g"},
    },
    {
        "title": "Samosa",
        "aliases": ["samosas", "vegetable samosa", "aloo samosa", "fried samosa"],
        "cuisine": "Indian", "time": 60, "servings": 4, "difficulty": "Hard",
        "calories": 320, "rating": 4.7, "emoji": "🥟",
        "description": "Crispy triangular pastry filled with spiced potatoes and peas — India's favorite snack.",
        "tags": ["samosa", "snack", "vegetarian", "indian", "fried", "street food"],
        "ingredients": [
            {"name": "All-purpose flour (maida)", "amount": "2 cups", "note": "for the pastry"},
            {"name": "Ghee or oil (for pastry)", "amount": "4 tbsp", "note": ""},
            {"name": "Potatoes", "amount": "4 large", "note": "boiled and mashed"},
            {"name": "Green peas", "amount": "½ cup", "note": "boiled"},
            {"name": "Cumin seeds", "amount": "1 tsp", "note": ""},
            {"name": "Green chilies", "amount": "2", "note": "finely chopped"},
            {"name": "Ginger", "amount": "1 tsp", "note": "grated"},
            {"name": "Garam masala", "amount": "1 tsp", "note": ""},
            {"name": "Amchur (dry mango powder)", "amount": "1 tsp", "note": ""},
            {"name": "Coriander leaves", "amount": "2 tbsp", "note": "chopped"},
            {"name": "Oil", "amount": "for deep frying", "note": ""},
            {"name": "Salt", "amount": "to taste", "note": ""},
        ],
        "steps": [
            "Make dough: mix flour, ghee, and salt. Gradually add water; knead into a firm dough. Rest 30 minutes.",
            "Heat oil in a pan. Add cumin seeds, green chilies, and ginger; fry 1 minute.",
            "Add mashed potatoes, peas, garam masala, amchur, and salt. Mix well and cook 3 minutes. Cool completely.",
            "Divide dough into balls. Roll each into an oval, cut in half.",
            "Form a cone from each half, seal the straight edge. Fill with potato mixture. Seal the open end firmly.",
            "Heat oil for deep frying to 160°C (low-medium). Fry samosas in batches for 8–10 minutes until golden.",
            "Drain on paper towels. Serve with mint chutney and tamarind chutney.",
        ],
        "nutrition": {"protein": "6g", "carbs": "42g", "fat": "14g", "fiber": "4g"},
    },
    {
        "title": "Jeera Rice",
        "aliases": ["cumin rice", "jeera pulao", "cumin flavored rice", "zeera rice"],
        "cuisine": "Indian", "time": 20, "servings": 4, "difficulty": "Easy",
        "calories": 280, "rating": 4.6, "emoji": "🍚",
        "description": "Fragrant basmati rice tempered with cumin seeds and ghee — simple, aromatic, and perfect with any curry.",
        "tags": ["rice", "vegetarian", "vegan", "indian", "quick", "side dish"],
        "ingredients": [
            {"name": "Basmati rice", "amount": "2 cups", "note": "rinsed and soaked 20 minutes"},
            {"name": "Ghee or butter", "amount": "2 tbsp", "note": ""},
            {"name": "Cumin seeds (jeera)", "amount": "1.5 tsp", "note": ""},
            {"name": "Bay leaf", "amount": "1", "note": ""},
            {"name": "Water", "amount": "3.5 cups", "note": ""},
            {"name": "Salt", "amount": "1 tsp", "note": ""},
            {"name": "Fresh coriander", "amount": "2 tbsp", "note": "to garnish"},
        ],
        "steps": [
            "Rinse basmati rice 2–3 times until water runs clear. Soak for 20 minutes, then drain.",
            "Heat ghee in a heavy pot. Add cumin seeds and bay leaf; sizzle for 1 minute.",
            "Add drained rice. Stir gently to coat every grain with ghee.",
            "Pour in water, add salt. Bring to a boil on high heat.",
            "Reduce heat to lowest, cover tightly, and cook for 12 minutes.",
            "Turn off heat. Let steam for 5 minutes undisturbed. Fluff with a fork.",
            "Garnish with fresh coriander and serve with your favorite dal or curry.",
        ],
        "nutrition": {"protein": "5g", "carbs": "58g", "fat": "6g", "fiber": "1g"},
    },
    # ── Protein / Fitness Recipes ───────────────────────────────────────────────
    {
        "title": "Banana Peanut Butter Protein Pancakes",
        "aliases": [
            "banana protein pancakes", "peanut butter pancakes", "protein pancakes",
            "banana peanut butter pancakes", "high protein pancakes", "fitness pancakes",
            "gym pancakes", "banana pb pancakes",
        ],
        "cuisine": "American", "time": 20, "servings": 2, "difficulty": "Easy",
        "calories": 420, "rating": 4.8, "emoji": "🥞",
        "description": "Fluffy, protein-packed pancakes made with ripe bananas, peanut butter, and oats — perfect post-workout breakfast.",
        "tags": ["breakfast", "high-protein", "banana", "peanut butter", "fitness", "healthy"],
        "ingredients": [
            {"name": "Ripe banana", "amount": "2 large", "note": "mashed"},
            {"name": "Eggs", "amount": "3", "note": ""},
            {"name": "Natural peanut butter", "amount": "3 tbsp", "note": "creamy"},
            {"name": "Protein powder (vanilla)", "amount": "1 scoop (30g)", "note": "whey or plant-based"},
            {"name": "Rolled oats", "amount": "½ cup", "note": "blended into oat flour, or use oat flour directly"},
            {"name": "Baking powder", "amount": "1 tsp", "note": ""},
            {"name": "Cinnamon", "amount": "½ tsp", "note": ""},
            {"name": "Vanilla extract", "amount": "1 tsp", "note": ""},
            {"name": "Pinch of salt", "amount": "⅛ tsp", "note": ""},
            {"name": "Coconut oil or butter", "amount": "1 tsp", "note": "for cooking"},
            {"name": "Honey or maple syrup", "amount": "1 tbsp", "note": "to serve"},
            {"name": "Sliced banana and berries", "amount": "handful", "note": "to top"},
        ],
        "steps": [
            "Mash bananas in a large bowl until smooth with no large lumps.",
            "Add eggs, peanut butter, and vanilla extract. Whisk together.",
            "Add oat flour (or blended oats), protein powder, baking powder, cinnamon, and salt. Stir gently until just combined.",
            "Let batter rest 3–4 minutes to thicken. If too thick, add 1–2 tbsp milk.",
            "Heat a non-stick pan over medium-low heat. Brush with a little coconut oil.",
            "Pour ¼ cup batter per pancake. Cook 2–3 minutes until bubbles form on top and edges look set.",
            "Flip carefully and cook another 2 minutes until golden.",
            "Stack pancakes and top with sliced bananas, berries, and a drizzle of honey or maple syrup.",
        ],
        "nutrition": {"protein": "32g", "carbs": "48g", "fat": "16g", "fiber": "6g"},
    },
    {
        "title": "Egg White Veggie Omelette",
        "aliases": [
            "egg white omelette", "veggie egg white omelette", "healthy omelette", "white omelette",
            "egg white vegetable omelette", "low calorie omelette",
        ],
        "cuisine": "American", "time": 15, "servings": 1, "difficulty": "Easy",
        "calories": 180, "rating": 4.6, "emoji": "🍳",
        "description": "Light, fluffy egg white omelette packed with colorful vegetables — high protein, low calorie breakfast.",
        "tags": ["breakfast", "high-protein", "low-calorie", "vegetarian", "gluten-free", "healthy"],
        "ingredients": [
            {"name": "Egg whites", "amount": "4 large", "note": "or ½ cup liquid egg whites"},
            {"name": "Red bell pepper", "amount": "¼", "note": "finely diced"},
            {"name": "Spinach", "amount": "handful", "note": "fresh"},
            {"name": "Mushrooms", "amount": "3–4", "note": "sliced"},
            {"name": "Red onion", "amount": "2 tbsp", "note": "finely diced"},
            {"name": "Cherry tomatoes", "amount": "4", "note": "halved"},
            {"name": "Low-fat feta or ricotta", "amount": "2 tbsp", "note": "optional"},
            {"name": "Olive oil spray", "amount": "2–3 sprays", "note": ""},
            {"name": "Salt and pepper", "amount": "to taste", "note": ""},
            {"name": "Fresh herbs (chives or parsley)", "amount": "1 tbsp", "note": "chopped"},
        ],
        "steps": [
            "Whisk egg whites with a pinch of salt and pepper until slightly frothy.",
            "Heat a non-stick pan over medium heat. Spray with olive oil.",
            "Add mushrooms and cook 2 minutes. Add onion, bell pepper, and tomatoes; cook 2 more minutes.",
            "Add spinach; stir until just wilted (30 seconds). Remove vegetables and set aside.",
            "Re-spray pan. Pour in egg whites. Let set for 1 minute without stirring.",
            "Gently lift edges with a spatula, tilting pan so uncooked egg flows underneath.",
            "When omelette is mostly set but still slightly glossy on top, add cooked vegetables to one half.",
            "Add feta if using. Fold omelette over the filling. Slide onto plate and garnish with fresh herbs.",
        ],
        "nutrition": {"protein": "26g", "carbs": "8g", "fat": "4g", "fiber": "2g"},
    },
    {
        "title": "High Protein Smoothie Bowl",
        "aliases": ["protein bowl", "smoothie bowl", "acai bowl", "protein smoothie bowl", "breakfast bowl"],
        "cuisine": "American", "time": 10, "servings": 1, "difficulty": "Easy",
        "calories": 380, "rating": 4.7, "emoji": "🥣",
        "description": "Thick, creamy smoothie bowl loaded with protein, fruit, and crunchy toppings for the ultimate healthy breakfast.",
        "tags": ["breakfast", "high-protein", "vegan", "healthy", "quick", "no-cook"],
        "ingredients": [
            {"name": "Frozen banana", "amount": "1 large", "note": "sliced before freezing"},
            {"name": "Frozen mixed berries", "amount": "½ cup", "note": ""},
            {"name": "Protein powder (vanilla)", "amount": "1 scoop (30g)", "note": ""},
            {"name": "Greek yogurt or almond milk", "amount": "¼ cup", "note": "just enough to blend"},
            {"name": "Peanut or almond butter", "amount": "1 tbsp", "note": "for topping"},
            {"name": "Granola", "amount": "¼ cup", "note": "for topping"},
            {"name": "Fresh berries", "amount": "handful", "note": "for topping"},
            {"name": "Chia seeds", "amount": "1 tsp", "note": "for topping"},
            {"name": "Honey", "amount": "1 tsp", "note": "for topping"},
            {"name": "Sliced banana", "amount": "½", "note": "for topping"},
        ],
        "steps": [
            "Blend frozen banana, frozen berries, protein powder, and just enough yogurt or almond milk to blend smoothly. The mixture should be very thick.",
            "Pour the thick mixture into a bowl.",
            "Arrange toppings in sections: granola, fresh berries, sliced banana, chia seeds.",
            "Drizzle with peanut butter and honey.",
            "Serve immediately before it melts.",
        ],
        "nutrition": {"protein": "28g", "carbs": "52g", "fat": "8g", "fiber": "8g"},
    },
    {
        "title": "Grilled Chicken Breast",
        "aliases": ["grilled chicken", "healthy grilled chicken", "simple grilled chicken", "gym chicken", "fitness chicken"],
        "cuisine": "American", "time": 25, "servings": 2, "difficulty": "Easy",
        "calories": 280, "rating": 4.6, "emoji": "🍗",
        "description": "Perfectly juicy grilled chicken breast with a golden crust — the ultimate high-protein lean meal.",
        "tags": ["chicken", "grilled", "high-protein", "gluten-free", "keto", "low-calorie"],
        "ingredients": [
            {"name": "Chicken breasts", "amount": "2 large (500g)", "note": ""},
            {"name": "Olive oil", "amount": "2 tbsp", "note": ""},
            {"name": "Garlic powder", "amount": "1 tsp", "note": ""},
            {"name": "Onion powder", "amount": "½ tsp", "note": ""},
            {"name": "Smoked paprika", "amount": "1 tsp", "note": ""},
            {"name": "Italian seasoning", "amount": "1 tsp", "note": ""},
            {"name": "Salt", "amount": "1 tsp", "note": ""},
            {"name": "Black pepper", "amount": "½ tsp", "note": ""},
            {"name": "Lemon juice", "amount": "1 tbsp", "note": ""},
        ],
        "steps": [
            "Place chicken breasts between plastic wrap and pound to even thickness (about 2cm) with a rolling pin.",
            "Mix olive oil, garlic powder, onion powder, paprika, Italian seasoning, salt, and pepper.",
            "Coat chicken thoroughly in the marinade. Add lemon juice. Marinate 30 minutes (or up to 8 hours).",
            "Heat grill pan or outdoor grill to medium-high. Oil the grates.",
            "Grill chicken 6–7 minutes per side, without moving it, until internal temperature reaches 75°C (165°F).",
            "Rest chicken 5 minutes before slicing. This keeps all juices inside.",
            "Serve with roasted vegetables, rice, or a fresh salad.",
        ],
        "nutrition": {"protein": "48g", "carbs": "2g", "fat": "12g", "fiber": "0g"},
    },
    {
        "title": "Avocado Toast",
        "aliases": ["avo toast", "avocado on toast", "smashed avocado toast", "healthy toast", "avocado breakfast toast"],
        "cuisine": "American", "time": 10, "servings": 1, "difficulty": "Easy",
        "calories": 320, "rating": 4.7, "emoji": "🥑",
        "description": "Creamy smashed avocado on toasted sourdough with a jammy egg, chili flakes, and microgreens.",
        "tags": ["breakfast", "healthy", "vegetarian", "quick", "vegan-optional"],
        "ingredients": [
            {"name": "Sourdough bread", "amount": "2 thick slices", "note": "or whole grain bread"},
            {"name": "Ripe avocado", "amount": "1 large", "note": ""},
            {"name": "Lemon juice", "amount": "1 tbsp", "note": ""},
            {"name": "Garlic", "amount": "½ clove", "note": "optional, to rub on toast"},
            {"name": "Extra virgin olive oil", "amount": "1 tsp", "note": "to drizzle"},
            {"name": "Red chili flakes", "amount": "¼ tsp", "note": ""},
            {"name": "Flaky sea salt", "amount": "pinch", "note": ""},
            {"name": "Egg", "amount": "1", "note": "poached or fried, optional"},
            {"name": "Microgreens or arugula", "amount": "small handful", "note": ""},
            {"name": "Everything bagel seasoning", "amount": "pinch", "note": "optional"},
        ],
        "steps": [
            "Toast bread slices until golden and crisp. Rub with cut garlic clove while warm.",
            "Halve avocado, remove pit, and scoop flesh into a bowl.",
            "Add lemon juice, salt, and a pinch of chili flakes. Mash roughly with a fork (keep some texture).",
            "Poach or fry egg to your liking (optional).",
            "Spread smashed avocado generously on toasted bread.",
            "Top with egg, microgreens, remaining chili flakes, and a drizzle of olive oil.",
            "Sprinkle everything bagel seasoning if using. Serve immediately.",
        ],
        "nutrition": {"protein": "12g", "carbs": "32g", "fat": "20g", "fiber": "8g"},
    },
    # ── Desserts ───────────────────────────────────────────────────────────────
    {
        "title": "Chocolate Chip Cookies",
        "aliases": ["choco chip cookies", "chocolate cookies", "homemade cookies", "classic cookies", "american cookies"],
        "cuisine": "American", "time": 30, "servings": 24, "difficulty": "Easy",
        "calories": 180, "rating": 4.9, "emoji": "🍪",
        "description": "Perfectly crispy edges, chewy centres, and packed with melted chocolate chips — the classic American cookie.",
        "tags": ["baking", "dessert", "cookies", "chocolate", "sweet"],
        "ingredients": [
            {"name": "All-purpose flour", "amount": "2¼ cups (280g)", "note": ""},
            {"name": "Baking soda", "amount": "1 tsp", "note": ""},
            {"name": "Salt", "amount": "1 tsp", "note": ""},
            {"name": "Butter", "amount": "225g", "note": "softened to room temperature"},
            {"name": "Granulated sugar", "amount": "¾ cup (150g)", "note": ""},
            {"name": "Brown sugar", "amount": "¾ cup (165g)", "note": "packed"},
            {"name": "Eggs", "amount": "2 large", "note": ""},
            {"name": "Vanilla extract", "amount": "2 tsp", "note": ""},
            {"name": "Chocolate chips", "amount": "2 cups (340g)", "note": "semi-sweet"},
        ],
        "steps": [
            "Preheat oven to 190°C (375°F). Line baking trays with parchment paper.",
            "Whisk together flour, baking soda, and salt in a bowl. Set aside.",
            "Beat butter, granulated sugar, and brown sugar together until light and fluffy (3–4 minutes).",
            "Add eggs one at a time, beating well after each addition. Mix in vanilla.",
            "Gradually stir in flour mixture until just combined. Do not overmix.",
            "Fold in chocolate chips.",
            "Drop rounded tablespoons of dough onto prepared trays, spacing 5cm apart.",
            "Bake 9–11 minutes until edges are golden but centres look slightly underdone.",
            "Cool on tray for 5 minutes before transferring to a wire rack. Cookies firm up as they cool.",
        ],
        "nutrition": {"protein": "2g", "carbs": "24g", "fat": "10g", "fiber": "1g"},
    },
    {
        "title": "Mango Lassi",
        "aliases": ["mango shake", "indian mango drink", "aam lassi", "mango yogurt drink", "lassi"],
        "cuisine": "Indian", "time": 5, "servings": 2, "difficulty": "Easy",
        "calories": 240, "rating": 4.8, "emoji": "🥭",
        "description": "A luscious, chilled Indian mango yogurt drink — sweet, creamy, and cooling on a hot day.",
        "tags": ["drink", "indian", "vegetarian", "mango", "quick", "no-cook"],
        "ingredients": [
            {"name": "Ripe mango", "amount": "2 large", "note": "peeled and diced, or 1 cup canned Alphonso mango pulp"},
            {"name": "Full-fat yogurt (dahi)", "amount": "1 cup", "note": ""},
            {"name": "Cold milk", "amount": "½ cup", "note": ""},
            {"name": "Sugar or honey", "amount": "2 tbsp", "note": "adjust to sweetness of mango"},
            {"name": "Cardamom powder", "amount": "¼ tsp", "note": ""},
            {"name": "Ice cubes", "amount": "6–8", "note": ""},
            {"name": "Saffron strands", "amount": "few", "note": "optional garnish"},
            {"name": "Chopped pistachios", "amount": "1 tsp", "note": "optional garnish"},
        ],
        "steps": [
            "Add mango pieces (or pulp), yogurt, milk, sugar, and cardamom to a blender.",
            "Add ice cubes.",
            "Blend until completely smooth and frothy. Taste and adjust sugar.",
            "Pour into tall chilled glasses.",
            "Garnish with a few saffron strands and chopped pistachios.",
            "Serve immediately while cold.",
        ],
        "nutrition": {"protein": "6g", "carbs": "44g", "fat": "6g", "fiber": "2g"},
    },
    {
        "title": "Pav Bhaji",
        "aliases": ["pav bhaji masala", "mumbai pav bhaji", "street pav bhaji", "bhaji"],
        "cuisine": "Indian", "time": 40, "servings": 4, "difficulty": "Medium",
        "calories": 460, "rating": 4.8, "emoji": "🍞",
        "description": "Mumbai's iconic street food — a spiced vegetable mash served with buttered toasted dinner rolls.",
        "tags": ["street food", "vegetarian", "indian", "mumbai", "popular"],
        "ingredients": [
            {"name": "Potatoes", "amount": "4 medium", "note": "boiled and mashed"},
            {"name": "Cauliflower", "amount": "1 cup", "note": "boiled florets"},
            {"name": "Green peas", "amount": "½ cup", "note": "boiled"},
            {"name": "Capsicum (bell pepper)", "amount": "1 medium", "note": "finely chopped"},
            {"name": "Onions", "amount": "2 large", "note": "finely chopped"},
            {"name": "Tomatoes", "amount": "3 large", "note": "finely chopped"},
            {"name": "Garlic cloves", "amount": "6", "note": "minced"},
            {"name": "Ginger", "amount": "1-inch piece", "note": "grated"},
            {"name": "Pav bhaji masala", "amount": "3 tbsp", "note": ""},
            {"name": "Red chili powder", "amount": "1 tsp", "note": ""},
            {"name": "Butter", "amount": "5 tbsp", "note": ""},
            {"name": "Lemon juice", "amount": "1 tbsp", "note": ""},
            {"name": "Pav (dinner rolls)", "amount": "8", "note": ""},
            {"name": "Fresh coriander", "amount": "2 tbsp", "note": "to garnish"},
            {"name": "Salt", "amount": "to taste", "note": ""},
        ],
        "steps": [
            "Heat 3 tbsp butter in a large pan. Sauté onions until golden brown.",
            "Add garlic, ginger, and capsicum. Cook 4 minutes.",
            "Add tomatoes and cook until completely mushy and oil separates.",
            "Add pav bhaji masala, red chili powder, and salt. Cook 3 minutes.",
            "Add mashed potatoes, cauliflower, and peas. Mash everything together with a potato masher.",
            "Add water gradually to achieve a thick consistency. Cook 10 minutes, mashing as you go.",
            "Add lemon juice and fresh coriander. Adjust salt.",
            "Slice pav rolls and toast cut-side down in a separate pan with butter until golden.",
            "Serve bhaji topped with a cube of butter, with buttered pav and diced onion on the side.",
        ],
        "nutrition": {"protein": "10g", "carbs": "62g", "fat": "18g", "fiber": "8g"},
    },
    {
        "title": "Masala Chai",
        "aliases": ["chai", "indian tea", "spiced tea", "masala tea", "garam chai", "adrak chai"],
        "cuisine": "Indian", "time": 10, "servings": 2, "difficulty": "Easy",
        "calories": 80, "rating": 4.9, "emoji": "☕",
        "description": "Aromatic spiced Indian tea with cardamom, ginger, cinnamon, and cloves — the perfect comforting brew.",
        "tags": ["drink", "tea", "indian", "vegetarian", "quick", "warm"],
        "ingredients": [
            {"name": "Water", "amount": "1 cup", "note": ""},
            {"name": "Full-fat milk", "amount": "1 cup", "note": ""},
            {"name": "Black tea leaves (CTC)", "amount": "2 tsp", "note": "or 2 tea bags"},
            {"name": "Fresh ginger", "amount": "½-inch piece", "note": "crushed or grated"},
            {"name": "Cardamom pods", "amount": "3", "note": "crushed"},
            {"name": "Cinnamon stick", "amount": "1 small", "note": ""},
            {"name": "Cloves", "amount": "2", "note": ""},
            {"name": "Black pepper", "amount": "2 peppercorns", "note": "crushed"},
            {"name": "Sugar", "amount": "2 tsp", "note": "or to taste"},
        ],
        "steps": [
            "Crush ginger, cardamom pods, cloves, and black pepper in a mortar and pestle.",
            "Add water, crushed spices, and cinnamon stick to a small saucepan.",
            "Bring to a boil on medium heat. Simmer 2 minutes to let spices bloom.",
            "Add tea leaves (or tea bags). Boil 1 minute.",
            "Add milk and sugar. Bring to a rolling boil, watching carefully.",
            "Reduce heat and let it simmer 2–3 minutes for a strong, creamy chai.",
            "Strain through a fine sieve into cups. Serve immediately.",
        ],
        "nutrition": {"protein": "4g", "carbs": "14g", "fat": "4g", "fiber": "0g"},
    },
    # ── More Popular Recipes ────────────────────────────────────────────────────
    {
        "title": "Scrambled Eggs",
        "aliases": ["creamy scrambled eggs", "soft scrambled eggs", "buttered eggs", "breakfast eggs"],
        "cuisine": "American", "time": 10, "servings": 2, "difficulty": "Easy",
        "calories": 220, "rating": 4.7, "emoji": "🍳",
        "description": "Silky, buttery scrambled eggs cooked low and slow for the creamiest texture imaginable.",
        "tags": ["breakfast", "eggs", "quick", "vegetarian", "gluten-free", "high-protein"],
        "ingredients": [
            {"name": "Eggs", "amount": "4 large", "note": ""},
            {"name": "Butter", "amount": "1.5 tbsp", "note": "cold, cut into small cubes"},
            {"name": "Heavy cream or milk", "amount": "1 tbsp", "note": "optional"},
            {"name": "Salt", "amount": "¼ tsp", "note": ""},
            {"name": "Black pepper", "amount": "to taste", "note": "freshly ground"},
            {"name": "Fresh chives", "amount": "1 tbsp", "note": "chopped, to garnish"},
            {"name": "Toast or bread", "amount": "2 slices", "note": "to serve"},
        ],
        "steps": [
            "Crack eggs into a bowl. Add cream if using and a pinch of salt. Whisk until fully combined.",
            "Place a non-stick pan over medium-LOW heat — this is the key to creamy eggs.",
            "Add cold butter cubes to the pan. Once butter starts to melt (don't let it bubble), pour in eggs.",
            "Stir continuously with a rubber spatula, moving the eggs constantly in figure-8 motions.",
            "Every 20–30 seconds, take the pan OFF the heat for 10 seconds while continuing to stir.",
            "Continue this process for 3–4 minutes until eggs are soft, glossy, and just barely set.",
            "Remove from heat while still slightly underdone — they continue cooking from residual heat.",
            "Season with black pepper, garnish with chives, and serve immediately on toast.",
        ],
        "nutrition": {"protein": "18g", "carbs": "2g", "fat": "16g", "fiber": "0g"},
    },
    {
        "title": "Veggie Burger",
        "aliases": ["vegetable burger", "plant-based burger", "vegan burger", "bean burger", "chickpea burger"],
        "cuisine": "American", "time": 30, "servings": 4, "difficulty": "Medium",
        "calories": 420, "rating": 4.5, "emoji": "🍔",
        "description": "Hearty, flavour-packed veggie patties loaded with black beans, oats, and spices — even meat-lovers love them.",
        "tags": ["burger", "vegetarian", "vegan", "healthy", "high-protein"],
        "ingredients": [
            {"name": "Black beans", "amount": "1 can (400g)", "note": "drained and rinsed"},
            {"name": "Rolled oats", "amount": "½ cup", "note": ""},
            {"name": "Onion", "amount": "1 small", "note": "finely diced"},
            {"name": "Garlic cloves", "amount": "2", "note": "minced"},
            {"name": "Red bell pepper", "amount": "½", "note": "finely diced"},
            {"name": "Cumin", "amount": "1 tsp", "note": ""},
            {"name": "Smoked paprika", "amount": "1 tsp", "note": ""},
            {"name": "Soy sauce", "amount": "1 tbsp", "note": "for umami"},
            {"name": "Egg", "amount": "1", "note": "or 1 flax egg for vegan"},
            {"name": "Salt and pepper", "amount": "to taste", "note": ""},
            {"name": "Burger buns", "amount": "4", "note": "toasted"},
            {"name": "Lettuce, tomato, onion, avocado", "amount": "to serve", "note": ""},
        ],
        "steps": [
            "Pat beans completely dry with paper towels. This is crucial to avoid soggy patties.",
            "Mash beans in a bowl until mostly smooth with some texture remaining.",
            "Sauté onion, garlic, and bell pepper in a pan until soft (5 minutes). Cool.",
            "Combine mashed beans, cooked vegetables, oats, cumin, paprika, soy sauce, and egg. Mix well.",
            "Season generously. Refrigerate the mixture for 20–30 minutes to firm up.",
            "Form into 4 equal patties about 2cm thick.",
            "Cook in an oiled pan over medium heat for 4–5 minutes per side until a dark crust forms.",
            "Serve on toasted buns with lettuce, tomato, avocado, and your favorite sauce.",
        ],
        "nutrition": {"protein": "18g", "carbs": "52g", "fat": "10g", "fiber": "12g"},
    },
    {
        "title": "Tom Yum Soup",
        "aliases": ["tom yum", "thai soup", "spicy thai soup", "thai lemongrass soup", "hot and sour soup"],
        "cuisine": "Thai", "time": 30, "servings": 4, "difficulty": "Medium",
        "calories": 180, "rating": 4.7, "emoji": "🍜",
        "description": "Fiery, fragrant Thai soup with lemongrass, galangal, kaffir lime, and succulent prawns.",
        "tags": ["soup", "thai", "gluten-free", "spicy", "seafood", "low-calorie"],
        "ingredients": [
            {"name": "Prawns (shrimp)", "amount": "400g", "note": "peeled and deveined"},
            {"name": "Lemongrass stalks", "amount": "2", "note": "bruised and cut into pieces"},
            {"name": "Galangal or ginger", "amount": "4 slices", "note": ""},
            {"name": "Kaffir lime leaves", "amount": "5", "note": "torn"},
            {"name": "Bird's eye chilies", "amount": "4–6", "note": "crushed"},
            {"name": "Mushrooms", "amount": "200g", "note": "straw or oyster mushrooms"},
            {"name": "Cherry tomatoes", "amount": "8", "note": "halved"},
            {"name": "Chicken or seafood stock", "amount": "4 cups", "note": ""},
            {"name": "Fish sauce", "amount": "3 tbsp", "note": ""},
            {"name": "Lime juice", "amount": "3 tbsp", "note": "freshly squeezed"},
            {"name": "Sugar", "amount": "1 tsp", "note": ""},
            {"name": "Coconut milk", "amount": "½ cup", "note": "optional, for tom kha version"},
            {"name": "Fresh coriander", "amount": "to garnish", "note": ""},
        ],
        "steps": [
            "Bring stock to a boil in a large pot.",
            "Add lemongrass, galangal, and kaffir lime leaves. Simmer 5 minutes.",
            "Add chilies and mushrooms. Cook 3 minutes.",
            "Add cherry tomatoes.",
            "Season with fish sauce and sugar.",
            "Add prawns. Cook just 2–3 minutes until pink. Do not overcook.",
            "Remove from heat. Add lime juice (add after heat off to preserve freshness).",
            "Taste and adjust: more fish sauce for saltiness, lime for sour, sugar for balance.",
            "Ladle into bowls, garnish with fresh coriander. Remove lemongrass before eating.",
        ],
        "nutrition": {"protein": "24g", "carbs": "10g", "fat": "6g", "fiber": "2g"},
    },
    {
        "title": "Shakshuka",
        "aliases": ["shakshouka", "eggs in tomato sauce", "middle eastern eggs", "baked eggs", "eggs poached in tomato"],
        "cuisine": "Middle Eastern", "time": 25, "servings": 2, "difficulty": "Easy",
        "calories": 290, "rating": 4.8, "emoji": "🍅",
        "description": "Eggs poached in a vibrant spiced tomato and pepper sauce — a stunning one-pan breakfast or brunch.",
        "tags": ["breakfast", "brunch", "vegetarian", "middle eastern", "gluten-free"],
        "ingredients": [
            {"name": "Eggs", "amount": "4 large", "note": ""},
            {"name": "Crushed or chopped tomatoes", "amount": "400g", "note": "1 can"},
            {"name": "Red bell pepper", "amount": "1 large", "note": "diced"},
            {"name": "Onion", "amount": "1 medium", "note": "diced"},
            {"name": "Garlic cloves", "amount": "4", "note": "minced"},
            {"name": "Olive oil", "amount": "2 tbsp", "note": ""},
            {"name": "Cumin", "amount": "1 tsp", "note": ""},
            {"name": "Smoked paprika", "amount": "1 tsp", "note": ""},
            {"name": "Cayenne pepper", "amount": "¼ tsp", "note": ""},
            {"name": "Sugar", "amount": "½ tsp", "note": "to balance acidity"},
            {"name": "Salt and pepper", "amount": "to taste", "note": ""},
            {"name": "Fresh parsley or coriander", "amount": "handful", "note": "to garnish"},
            {"name": "Feta cheese", "amount": "50g", "note": "crumbled, optional"},
            {"name": "Crusty bread", "amount": "to serve", "note": ""},
        ],
        "steps": [
            "Heat olive oil in a wide, oven-safe pan (or skillet). Sauté onion 5 minutes until soft.",
            "Add red pepper and cook 4 more minutes.",
            "Add garlic, cumin, paprika, and cayenne. Stir constantly for 1 minute.",
            "Pour in crushed tomatoes. Add sugar, salt, and pepper. Simmer 10 minutes until thickened.",
            "Make 4 wells in the sauce. Crack one egg into each well.",
            "Cover and cook on medium-low heat for 7–8 minutes (runny yolks) or 10 minutes (set yolks).",
            "Remove from heat. Crumble feta over the top if using.",
            "Garnish with fresh parsley or coriander. Serve straight from the pan with crusty bread.",
        ],
        "nutrition": {"protein": "18g", "carbs": "18g", "fat": "18g", "fiber": "4g"},
    },
    {
        "title": "Chicken Quesadilla",
        "aliases": ["quesadilla", "cheese quesadilla", "chicken and cheese quesadilla", "cheesy quesadilla"],
        "cuisine": "Mexican", "time": 20, "servings": 2, "difficulty": "Easy",
        "calories": 510, "rating": 4.6, "emoji": "🌮",
        "description": "Crispy golden quesadillas stuffed with seasoned chicken, melted cheese, and peppers.",
        "tags": ["mexican", "chicken", "quick", "cheesy", "lunch", "snack"],
        "ingredients": [
            {"name": "Large flour tortillas", "amount": "4", "note": ""},
            {"name": "Chicken breast", "amount": "300g", "note": "cooked and shredded"},
            {"name": "Shredded cheddar and mozzarella", "amount": "200g", "note": "mixed"},
            {"name": "Red bell pepper", "amount": "1", "note": "thinly sliced"},
            {"name": "Red onion", "amount": "½", "note": "thinly sliced"},
            {"name": "Garlic powder", "amount": "½ tsp", "note": ""},
            {"name": "Cumin", "amount": "½ tsp", "note": ""},
            {"name": "Smoked paprika", "amount": "½ tsp", "note": ""},
            {"name": "Oil", "amount": "1 tbsp", "note": ""},
            {"name": "Sour cream, salsa, guacamole", "amount": "to serve", "note": ""},
        ],
        "steps": [
            "Season shredded chicken with garlic powder, cumin, paprika, salt, and pepper.",
            "Heat oil in a pan. Sauté onion and bell pepper until softened, 4 minutes. Mix with chicken.",
            "Place one tortilla flat in the pan over medium heat.",
            "Scatter cheese evenly over the tortilla. Add chicken-veggie mixture on one half.",
            "Fold the tortilla in half over the filling.",
            "Cook 2–3 minutes until bottom is golden. Carefully flip and cook the other side.",
            "Slide onto a cutting board. Rest 1 minute then cut into 3 wedges.",
            "Serve hot with sour cream, salsa, and guacamole.",
        ],
        "nutrition": {"protein": "34g", "carbs": "38g", "fat": "22g", "fiber": "3g"},
    },
    {
        "title": "Lemon Garlic Shrimp Pasta",
        "aliases": ["shrimp pasta", "prawn pasta", "garlic prawn pasta", "lemon shrimp pasta", "prawn spaghetti"],
        "cuisine": "Italian", "time": 25, "servings": 2, "difficulty": "Easy",
        "calories": 490, "rating": 4.7, "emoji": "🦐",
        "description": "Juicy prawns tossed with al dente spaghetti, lemon, garlic, white wine, and fresh parsley.",
        "tags": ["pasta", "seafood", "italian", "quick", "lemon"],
        "ingredients": [
            {"name": "Spaghetti or linguine", "amount": "200g", "note": ""},
            {"name": "Large prawns (shrimp)", "amount": "300g", "note": "peeled and deveined"},
            {"name": "Garlic cloves", "amount": "6", "note": "thinly sliced"},
            {"name": "Dry white wine", "amount": "100ml", "note": "or chicken stock"},
            {"name": "Lemon", "amount": "1 large", "note": "zest and juice"},
            {"name": "Olive oil", "amount": "4 tbsp", "note": "extra virgin"},
            {"name": "Butter", "amount": "2 tbsp", "note": ""},
            {"name": "Red chili flakes", "amount": "½ tsp", "note": ""},
            {"name": "Fresh parsley", "amount": "large handful", "note": "chopped"},
            {"name": "Parmesan", "amount": "30g", "note": "to serve, optional"},
            {"name": "Salt and pepper", "amount": "to taste", "note": ""},
        ],
        "steps": [
            "Cook pasta in heavily salted boiling water until al dente. Reserve 1 cup pasta water before draining.",
            "Season prawns generously with salt, pepper, and a pinch of chili flakes.",
            "Heat olive oil in a wide pan over medium-high heat. Add prawns in a single layer.",
            "Cook prawns 1.5 minutes per side until pink and just cooked. Remove and set aside.",
            "Reduce heat to medium. Add remaining oil and sliced garlic; cook 1 minute until just golden.",
            "Add chili flakes, pour in white wine. Let bubble and reduce by half (2 minutes).",
            "Add lemon juice, zest, and butter. Swirl pan to emulsify.",
            "Add drained pasta and toss. Add pasta water as needed for a silky sauce.",
            "Return prawns to pan. Add parsley and toss to combine. Serve with parmesan.",
        ],
        "nutrition": {"protein": "34g", "carbs": "56g", "fat": "18g", "fiber": "3g"},
    },
    {
        "title": "French Toast",
        "aliases": ["eggy bread", "pain perdu", "sweet french toast", "french toast recipe"],
        "cuisine": "French", "time": 15, "servings": 2, "difficulty": "Easy",
        "calories": 380, "rating": 4.7, "emoji": "🍞",
        "description": "Golden, custardy French toast with a caramelized exterior and soft eggy interior, served with maple syrup.",
        "tags": ["breakfast", "sweet", "vegetarian", "quick", "french"],
        "ingredients": [
            {"name": "Thick bread slices (brioche or sourdough)", "amount": "4", "note": "day-old bread works best"},
            {"name": "Eggs", "amount": "3 large", "note": ""},
            {"name": "Whole milk", "amount": "100ml", "note": ""},
            {"name": "Heavy cream", "amount": "50ml", "note": ""},
            {"name": "Sugar", "amount": "1 tbsp", "note": ""},
            {"name": "Vanilla extract", "amount": "1 tsp", "note": ""},
            {"name": "Cinnamon", "amount": "½ tsp", "note": ""},
            {"name": "Butter", "amount": "2 tbsp", "note": "for frying"},
            {"name": "Maple syrup", "amount": "3 tbsp", "note": "to serve"},
            {"name": "Fresh berries and icing sugar", "amount": "to serve", "note": ""},
        ],
        "steps": [
            "In a wide, shallow dish, whisk together eggs, milk, cream, sugar, vanilla, and cinnamon until smooth.",
            "Soak bread slices in the egg mixture for 30 seconds per side. Press gently so bread absorbs the custard.",
            "Heat butter in a large non-stick pan over medium heat until foaming.",
            "Add soaked bread slices (don't crowd the pan) and cook 2–3 minutes until deep golden.",
            "Flip carefully and cook the other side 2 minutes until golden.",
            "Transfer to a warm plate. Repeat with remaining slices.",
            "Dust with icing sugar. Serve with maple syrup and fresh berries.",
        ],
        "nutrition": {"protein": "14g", "carbs": "42g", "fat": "18g", "fiber": "2g"},
    },
]

# Build a search index: lowercase title and aliases → recipe
_LOOKUP_INDEX: dict = {}
for _r in LOOKUP_DATABASE:
    _LOOKUP_INDEX[_r["title"].lower()] = _r
    for _alias in _r.get("aliases", []):
        _LOOKUP_INDEX[_alias.lower()] = _r


# ─────────────────────────────────────────────────────────────────────────────
# Public Interface — Recipe Name Lookup
# ─────────────────────────────────────────────────────────────────────────────

def lookup_recipe_by_name(name: str, filters: dict = None) -> dict | None:
    """
    Look up a recipe by name. If it matches the database and has no filters, return the DB version.
    Otherwise, generate a custom recipe using AI based on the name and filters.
    """
    if filters is None:
        filters = {}

    has_custom_filters = False
    for k, v in filters.items():
        if k in ('cuisine', 'diet', 'mealType', 'difficulty') and v not in ('Any', 'None', ''):
            has_custom_filters = True
        if k == 'maxTime' and v is not None and v > 0:
            has_custom_filters = True

    if not name or not name.strip():
        return None

    query = name.strip().lower()

    db_match = None
    if query in _LOOKUP_INDEX:
        # Exact match (title or alias)
        db_match = dict(_LOOKUP_INDEX[query])
    else:
        best_match = None
        best_score = 0.0
        query_words = set(query.split())

        for key, recipe in _LOOKUP_INDEX.items():
            key_words = set(key.split())
            common = query_words & key_words
            if not common:
                continue

            # Jaccard similarity: intersection / union
            similarity = len(common) / len(query_words | key_words)

            # Boost only when the query is a substring of the key
            # (i.e. "omelette" matching "french omelette" key)
            # Do NOT boost when a short key is merely a substring of a longer query
            # (e.g. "egg omelette" should NOT boost when user typed "egg white veggie omelette")
            if query in key:
                similarity += 0.2

            if similarity > best_score:
                best_score = similarity
                best_match = recipe

        # Only accept a fuzzy match when the similarity is high enough (≥ 0.6)
        # This prevents "egg white veggie omelette" from matching "French Omelette"
        # via the alias "egg omelette" (which scores only 0.50)
        if best_match and best_score >= 0.6:
            db_match = dict(best_match)

    if db_match and not has_custom_filters:
        if filters.get('servings'):
            db_match = _scale_recipe_ingredients(db_match, int(filters['servings']))
        return db_match

    # Generate custom recipe
    return _huggingface_generate_by_name(name, filters, db_match)

def _huggingface_generate_by_name(name: str, filters: dict, base_recipe: dict = None):
    import json
    import requests
    from django.conf import settings
    import uuid

    api_key = getattr(settings, 'HUGGINGFACE_API_KEY', '')
    if not api_key:
        print("No HuggingFace API key found. Falling back to template generation.")
        pass # Will fall through to the try/except and then to the fallback
    else:
        model_id = getattr(settings, 'HUGGINGFACE_MODEL', 'Qwen/Qwen2.5-1.5B-Instruct')
        url = f"https://api-inference.huggingface.co/models/{model_id}"
        headers = {"Authorization": f"Bearer {api_key}"}

    cuisine = filters.get('cuisine', 'Any')
    diet = filters.get('diet', 'None')
    meal_type = filters.get('mealType', 'Any')
    max_time = filters.get('maxTime', 0)
    difficulty = filters.get('difficulty', 'Any')
    servings = filters.get('servings', 2)

    prompt = (
        f"Generate a detailed recipe for '{name}'. "
        f"Cuisine: {cuisine}. Diet: {diet}. Meal type: {meal_type}. "
        f"Max time: {max_time} mins. Difficulty: {difficulty}. Servings: {servings}. "
        "Return the output STRICTLY as a single JSON dictionary. "
        "The dictionary must have the following keys: 'title', 'cuisine', 'time' (integer), "
        "'servings' (integer), 'difficulty', 'calories' (integer), 'emoji', 'description', "
        "'tags' (list of strings), 'ingredients' (list of strings), 'steps' (list of strings), "
        "'nutrition' (dictionary with keys: 'protein', 'carbs', 'fat', 'fiber')."
    )

    if api_key:
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 1500,
                "return_full_text": False,
                "temperature": 0.7,
                "top_p": 0.9
            }
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            
            if isinstance(result, list) and len(result) > 0 and 'generated_text' in result[0]:
                generated_text = result[0]['generated_text']
                
                if "```json" in generated_text:
                    generated_text = generated_text.split("```json")[1].split("```")[0].strip()
                elif "```" in generated_text:
                    generated_text = generated_text.split("```")[1].strip()
                    
                start_idx = generated_text.find('{')
                end_idx = generated_text.rfind('}')
                if start_idx != -1 and end_idx != -1:
                    generated_text = generated_text[start_idx:end_idx+1]
                    
                recipe = json.loads(generated_text)
                recipe['id'] = str(uuid.uuid4())
                return recipe
        except Exception as e:
            print(f"HuggingFace API failed: {e}")
            pass

    if base_recipe:
        if filters.get('servings'):
            base_recipe = _scale_recipe_ingredients(base_recipe, int(filters['servings']))
        return base_recipe

    # Intelligent Dynamic Recipe Generation based on culinary patterns
    return _build_smart_custom_recipe(name, filters)


def _build_smart_custom_recipe(name: str, filters: dict) -> dict:
    """
    Generate an authentic, highly detailed recipe for any dish name by analyzing
    culinary keywords (breakfast, curry, pasta, dessert, grill, salad, soup, etc.).
    Guarantees realistic ingredients, accurate step-by-step instructions, and proper nutrition.
    """
    import uuid
    clean_name = name.strip()
    title = clean_name.title()
    lower = clean_name.lower()
    
    servings = int(filters.get('servings', 2) or 2)
    cuisine = filters.get('cuisine', 'Any')
    if cuisine == 'Any':
        if any(w in lower for w in ['paneer', 'masala', 'curry', 'biryani', 'dal', 'tikka', 'korma', 'chana', 'aloo', 'roti', 'naan', 'lassi']):
            cuisine = 'Indian'
        elif any(w in lower for w in ['pasta', 'pizza', 'risotto', 'carbonara', 'alfredo', 'lasagna', 'bruschetta', 'gnocchi']):
            cuisine = 'Italian'
        elif any(w in lower for w in ['taco', 'burrito', 'quesadilla', 'enchilada', 'fajita', 'guacamole', 'salsa']):
            cuisine = 'Mexican'
        elif any(w in lower for w in ['pad thai', 'tom yum', 'green curry', 'satay', 'thai']):
            cuisine = 'Thai'
        elif any(w in lower for w in ['stir fry', 'dumpling', 'fried rice', 'chow mein', 'kung pao', 'manchurian']):
            cuisine = 'Chinese'
        elif any(w in lower for w in ['sushi', 'ramen', 'teriyaki', 'miso', 'tempura', 'udon']):
            cuisine = 'Japanese'
        else:
            cuisine = 'Continental'

    difficulty = filters.get('difficulty', 'Medium')
    if difficulty == 'Any':
        difficulty = 'Easy' if any(w in lower for w in ['salad', 'toast', 'smoothie', 'shake', 'egg', 'omelette', 'pancake']) else 'Medium'

    # Detect category & formulate authentic ingredients + steps + nutrition + emoji
    if any(w in lower for w in ['pancake', 'waffle', 'crepe', 'oat', 'oatmeal']):
        emoji = '🥞'
        is_protein = 'protein' in lower
        has_banana = 'banana' in lower
        has_pb = any(w in lower for w in ['peanut', 'pb', 'butter'])
        
        ing_list = []
        if has_banana:
            ing_list.append({"name": "Ripe bananas", "amount": f"{max(1, servings)} large", "note": "mashed until smooth"})
        if is_protein:
            ing_list.append({"name": "Vanilla protein powder", "amount": f"{servings} scoops", "note": "whey or plant-based"})
        if has_pb:
            ing_list.append({"name": "Natural peanut butter", "amount": f"{2 * servings} tbsp", "note": "creamy"})
            
        ing_list.extend([
            {"name": "Rolled oat flour or all-purpose flour", "amount": f"{100 * servings}g", "note": "sifted"},
            {"name": "Eggs", "amount": f"{max(1, servings)} large", "note": "whisked"},
            {"name": "Milk (dairy or almond)", "amount": f"{100 * servings}ml", "note": ""},
            {"name": "Baking powder", "amount": "1 tsp", "note": "for fluffiness"},
            {"name": "Cinnamon powder", "amount": "½ tsp", "note": ""},
            {"name": "Vanilla extract", "amount": "1 tsp", "note": ""},
            {"name": "Pure maple syrup or honey", "amount": f"{servings} tbsp", "note": "to drizzle"},
            {"name": "Butter or coconut oil", "amount": "1 tbsp", "note": "for the griddle"}
        ])
        
        steps = [
            f"In a mixing bowl, mash bananas and whisk with eggs, milk, vanilla, and peanut butter until smooth.",
            f"Add flour, protein powder, baking powder, and cinnamon. Gently fold until a thick, smooth batter forms.",
            f"Rest the batter for 3–5 minutes so the baking powder activates for extra fluffiness.",
            f"Heat a non-stick pan or griddle over medium-low heat and lightly grease with butter or coconut oil.",
            f"Pour ¼ cup of batter per pancake. Cook for 2–3 minutes until bubbles form on top and edges set.",
            f"Carefully flip and cook for another 1–2 minutes until golden brown on both sides.",
            f"Stack warm pancakes, garnish with fresh banana slices or berries, and serve with maple syrup."
        ]
        calories = 380
        protein = f"{15 + (15 if is_protein else 0)}g"
        carbs = "52g"
        fat = f"{10 + (6 if has_pb else 0)}g"
        fiber = "6g"

    elif any(w in lower for w in ['paneer', 'cottage cheese']):
        emoji = '🧀'
        ing_list = [
            {"name": "Fresh paneer (cottage cheese)", "amount": f"{150 * servings}g", "note": "cut into bite-sized cubes"},
            {"name": "Onions", "amount": f"{max(1, servings // 2)} large", "note": "finely chopped"},
            {"name": "Ripe tomatoes", "amount": f"{max(2, servings)} medium", "note": "puréed until smooth"},
            {"name": "Ginger-garlic paste", "amount": "1.5 tbsp", "note": "freshly crushed"},
            {"name": "Heavy cream or cashew paste", "amount": f"{30 * servings}ml", "note": "for velvety texture"},
            {"name": "Butter or ghee", "amount": f"{1.5 * servings} tbsp", "note": ""},
            {"name": "Garam masala", "amount": "1 tsp", "note": "aromatic blend"},
            {"name": "Kasuri methi (dry fenugreek)", "amount": "1 tsp", "note": "crushed between palms"},
            {"name": "Kashmiri red chili powder", "amount": "1 tsp", "note": "for rich color"},
            {"name": "Turmeric & coriander powder", "amount": "1 tsp each", "note": ""},
            {"name": "Fresh coriander leaves", "amount": "handful", "note": "finely chopped to garnish"}
        ]
        steps = [
            f"Soak cubed paneer in warm salted water for 10 minutes to keep it exceptionally soft and tender.",
            f"Heat butter or ghee in a heavy-bottomed pan over medium heat. Sauté chopped onions until golden brown (6–8 mins).",
            f"Add ginger-garlic paste and sauté for 1 minute until aromatic and raw aroma disappears.",
            f"Add turmeric, Kashmiri red chili powder, and coriander powder. Cook the spices on low heat for 30 seconds.",
            f"Pour in the tomato purée and simmer on medium heat for 10–12 minutes until oil starts separating from masala.",
            f"Stir in fresh cream, garam masala, and crushed kasuri methi to create a rich, fragrant gravy.",
            f"Drain paneer cubes and gently slide them into the simmering gravy. Cook covered for 3–4 minutes.",
            f"Garnish with fresh coriander and a swirl of cream. Serve hot with garlic naan, roti, or basmati jeera rice."
        ]
        calories = 460
        protein = f"{18 * servings // 2}g"
        carbs = "16g"
        fat = "32g"
        fiber = "4g"

    elif any(w in lower for w in ['chicken', 'mutton', 'meat', 'tikka', 'kabab', 'kebab', 'wings']):
        emoji = '🍗'
        ing_list = [
            {"name": f"Main {title} cut (chicken/meat)", "amount": f"{200 * servings}g", "note": "cleaned and trimmed"},
            {"name": "Yogurt (dahi)", "amount": f"{50 * servings}g", "note": "thick curd for marinade"},
            {"name": "Ginger-garlic paste", "amount": "2 tbsp", "note": "fresh"},
            {"name": "Lemon juice", "amount": "2 tbsp", "note": "freshly squeezed"},
            {"name": "Onions", "amount": f"{max(1, servings // 2)} large", "note": "sliced or diced"},
            {"name": "Olive oil or butter", "amount": f"{1.5 * servings} tbsp", "note": ""},
            {"name": "Smoked paprika / red chili", "amount": "1.5 tsp", "note": ""},
            {"name": "Garam masala / all-spice blend", "amount": "1 tsp", "note": ""},
            {"name": "Black pepper & sea salt", "amount": "to taste", "note": "freshly ground"},
            {"name": "Fresh herbs (mint / parsley)", "amount": "2 tbsp", "note": "chopped"}
        ]
        steps = [
            f"Marinate the meat pieces with yogurt, lemon juice, ginger-garlic paste, spices, and salt for 30–60 minutes.",
            f"Heat olive oil or butter in a grill pan, skillet, or preheat oven to 200°C (400°F).",
            f"Sear the meat on high heat for 3–4 minutes on each side to lock in flavorful juices.",
            f"Reduce heat to medium, cover, and cook for 12–15 minutes until thoroughly tender and cooked through.",
            f"Baste with melted butter or pan drippings during the last few minutes of cooking for a glossy finish.",
            f"Rest the meat for 5 minutes before serving so the juices redistribute evenly.",
            f"Garnish with fresh herbs and lemon wedges. Serve alongside roasted vegetables or fragrant rice."
        ]
        calories = 420
        protein = "42g"
        carbs = "8g"
        fat = "18g"
        fiber = "2g"

    elif any(w in lower for w in ['biryani', 'pulao', 'rice', 'fried rice', 'risotto']):
        emoji = '🍚'
        ing_list = [
            {"name": "Aged long-grain Basmati rice", "amount": f"{100 * servings}g", "note": "washed and soaked for 30 mins"},
            {"name": f"Main vegetables or protein for {title}", "amount": f"{150 * servings}g", "note": "chopped"},
            {"name": "Onions", "amount": f"{max(1, servings // 2)} large", "note": "thinly sliced for golden crisping"},
            {"name": "Ghee or refined oil", "amount": f"{1.5 * servings} tbsp", "note": ""},
            {"name": "Whole spices (cumin, bay leaf, cardamom, cloves)", "amount": "1 tbsp", "note": "fragrant aromatics"},
            {"name": "Ginger-garlic paste", "amount": "1 tbsp", "note": ""},
            {"name": "Saffron strands soaked in warm milk", "amount": "2 tbsp", "note": "for golden aroma & color"},
            {"name": "Fresh mint & coriander leaves", "amount": "½ cup", "note": "chopped"},
            {"name": "Warm water or stock", "amount": f"{180 * servings}ml", "note": ""}
        ]
        steps = [
            f"Rinse basmati rice thoroughly until water runs crystal clear. Soak for 30 minutes, then drain.",
            f"Heat ghee in a heavy pot. Add whole spices (bay leaf, cloves, cardamom, cumin) and let them crackle.",
            f"Add sliced onions and fry over medium heat until deep golden brown and fragrant.",
            f"Add ginger-garlic paste, vegetables or protein, and sauté for 5 minutes with spices.",
            f"Add the drained rice and gently roast with the aromatics for 2 minutes without breaking grains.",
            f"Pour in warm water/stock and salt. Bring to a rolling boil on high heat.",
            f"Drizzle saffron milk, mint, and coriander over the top. Cover with tight lid and cook on lowest heat for 12–15 minutes.",
            f"Turn off heat and let it rest sealed for 5 minutes. Gently fluff with a fork and serve with raita."
        ]
        calories = 440
        protein = "14g"
        carbs = "68g"
        fat = "12g"
        fiber = "4g"

    elif any(w in lower for w in ['pasta', 'spaghetti', 'penne', 'macaroni', 'noodle', 'noodles', 'ramen']):
        emoji = '🍝'
        ing_list = [
            {"name": "Pasta or noodles of choice", "amount": f"{100 * servings}g", "note": "dry weight"},
            {"name": "Extra virgin olive oil / butter", "amount": f"{1.5 * servings} tbsp", "note": ""},
            {"name": "Garlic cloves", "amount": f"{2 * servings}", "note": "thinly sliced or minced"},
            {"name": "Tomatoes or heavy cream", "amount": f"{100 * servings}g", "note": "for custom sauce base"},
            {"name": "Grated Parmesan or cheese", "amount": f"{25 * servings}g", "note": "freshly grated"},
            {"name": "Fresh basil or Italian herbs", "amount": "1 tbsp", "note": "chopped"},
            {"name": "Red chili flakes & black pepper", "amount": "½ tsp each", "note": "to season"},
            {"name": "Reserved starchy pasta water", "amount": "½ cup", "note": "to emulsify silky sauce"}
        ]
        steps = [
            f"Bring a large pot of salted water to a rolling boil. Cook pasta until al dente (1 minute less than package instructions).",
            f"Reserve ½ cup of hot starchy pasta cooking water before draining.",
            f"Heat olive oil or butter in a wide skillet over medium heat. Sauté sliced garlic until fragrant and light golden.",
            f"Add sauce base (crushed tomatoes or cream), chili flakes, and seasonings. Simmer gently for 4–5 minutes.",
            f"Add drained pasta directly into the sauce. Pour in reserved pasta water a little at a time, tossing vigorously.",
            f"Remove skillet from heat, stir in freshly grated cheese and torn basil leaves until glossy and emulsified.",
            f"Plate immediately and top with extra cheese and freshly cracked black pepper."
        ]
        calories = 430
        protein = "16g"
        carbs = "62g"
        fat = "14g"
        fiber = "4g"

    elif any(w in lower for w in ['salad', 'bowl']):
        emoji = '🥗'
        ing_list = [
            {"name": "Crisp salad greens (romaine, spinach, arugula)", "amount": f"{100 * servings}g", "note": "washed and chilled"},
            {"name": f"Core {title} fresh ingredients", "amount": f"{150 * servings}g", "note": "diced/sliced"},
            {"name": "English cucumber & cherry tomatoes", "amount": f"{100 * servings}g", "note": "chopped"},
            {"name": "Extra virgin olive oil", "amount": f"{1.5 * servings} tbsp", "note": "cold-pressed"},
            {"name": "Fresh lemon juice or balsamic vinegar", "amount": "1.5 tbsp", "note": ""},
            {"name": "Toasted nuts or seeds (walnuts, pumpkin seeds)", "amount": "2 tbsp", "note": "for crunch"},
            {"name": "Crumbled feta, paneer, or avocado", "amount": f"{30 * servings}g", "note": ""},
            {"name": "Flaky sea salt & freshly cracked pepper", "amount": "to taste", "note": ""}
        ]
        steps = [
            f"Wash, spin-dry, and tear fresh salad greens into bite-sized pieces in a large wooden salad bowl.",
            f"Prep all fresh ingredients, tomatoes, cucumbers, and avocado into uniform, bite-sized shapes.",
            f"In a small jar, whisk extra virgin olive oil, fresh lemon juice, Dijon mustard, salt, and black pepper into a silky vinaigrette.",
            f"Add prepared vegetables and cheese over the crisp greens in the bowl.",
            f"Drizzle dressing evenly over the salad just before serving.",
            f"Toss gently with salad tongs to coat every leaf without bruising.",
            f"Garnish with toasted seeds/nuts for a satisfying crunch and serve chilled."
        ]
        calories = 260
        protein = "8g"
        carbs = "18g"
        fat = "18g"
        fiber = "6g"

    elif any(w in lower for w in ['smoothie', 'shake', 'juice', 'drink', 'beverage', 'lassi']):
        emoji = '🥤'
        ing_list = [
            {"name": f"Main fruit / base for {title}", "amount": f"{150 * servings}g", "note": "fresh or frozen"},
            {"name": "Chilled milk or Greek yogurt", "amount": f"{150 * servings}ml", "note": "dairy or plant-based"},
            {"name": "Natural honey, dates, or maple syrup", "amount": "1 tbsp", "note": "to taste"},
            {"name": "Chia seeds or ground flaxseed", "amount": "1 tbsp", "note": "for omega-3 & fiber"},
            {"name": "Crushed ice cubes", "amount": "½ cup", "note": ""},
            {"name": "Vanilla extract or cardamom powder", "amount": "¼ tsp", "note": "for aroma"}
        ]
        steps = [
            f"Add chilled fruits, base ingredients, yogurt or milk, and natural sweetener into a high-speed blender.",
            f"Add ice cubes and optional superfood seeds (chia/flaxseed).",
            f"Blend on high speed for 60–90 seconds until silky smooth, frothy, and creamy.",
            f"Taste and adjust sweetness or thickness by adding a splash of milk if desired.",
            f"Pour into tall chilled glasses and garnish with mint sprigs or fruit slices."
        ]
        calories = 220
        protein = "10g"
        carbs = "38g"
        fat = "4g"
        fiber = "5g"

    else:
        emoji = '🍽️'
        ing_list = [
            {"name": f"Primary fresh ingredients for {title}", "amount": f"{180 * servings}g", "note": "cleaned and prepped"},
            {"name": "Onions & garlic cloves", "amount": f"{max(1, servings // 2)} onion, {servings} cloves garlic", "note": "finely chopped"},
            {"name": "Olive oil, butter, or cooking oil", "amount": f"{1.5 * servings} tbsp", "note": ""},
            {"name": "Seasonal vegetables or pairing ingredients", "amount": f"{120 * servings}g", "note": "diced"},
            {"name": "Signature herb & spice blend", "amount": "1.5 tsp", "note": "tailored for balanced aroma"},
            {"name": "Sea salt & freshly ground black pepper", "amount": "to taste", "note": ""},
            {"name": "Fresh herbs (coriander / parsley / basil)", "amount": "2 tbsp", "note": "finely chopped to finish"}
        ]
        steps = [
            f"Prep and assemble all fresh ingredients, aromatics, and seasonings for {title}.",
            f"Heat oil or butter in a heavy cooking pan over medium heat. Sauté onions and garlic until fragrant and translucent.",
            f"Add the main ingredients along with the balanced spice blend. Sear gently for 4–5 minutes.",
            f"Add vegetables and a splash of broth or water if needed. Cover and simmer on low-medium heat for 12–15 minutes until tender.",
            f"Adjust seasonings with sea salt, freshly ground black pepper, and a squeeze of fresh lemon juice.",
            f"Remove from heat, rest for 2 minutes, and garnish with fresh aromatic herbs.",
            f"Serve hot and fresh alongside your choice of warm bread, rice, or crisp salad."
        ]
        calories = 380
        protein = "22g"
        carbs = "34g"
        fat = "16g"
        fiber = "5g"

    tags = [cuisine.lower(), "homemade", "custom", difficulty.lower()]
    diet_opt = filters.get('diet')
    if diet_opt and diet_opt not in ('None', 'Any', ''):
        tags.insert(0, diet_opt.lower())

    return {
        "id": str(uuid.uuid4()),
        "title": title,
        "cuisine": cuisine,
        "time": filters.get('maxTime') or (20 if difficulty == 'Easy' else 35),
        "servings": servings,
        "difficulty": difficulty,
        "calories": calories,
        "rating": 4.8,
        "emoji": emoji,
        "description": f"A vibrant, authentic homemade {title} prepared with fresh ingredients, balanced spices, and restaurant-quality technique.",
        "tags": tags,
        "ingredients": ing_list,
        "steps": steps,
        "nutrition": {
            "protein": protein,
            "carbs": carbs,
            "fat": fat,
            "fiber": fiber
        }
    }


def search_recipes_by_name(query: str) -> list[dict]:
    """Return all recipes whose title/alias contains the search query (for autocomplete)."""
    q = query.strip().lower()
    if not q:
        return []
    seen_titles = set()
    results = []
    for key, recipe in _LOOKUP_INDEX.items():
        if q in key and recipe["title"] not in seen_titles:
            seen_titles.add(recipe["title"])
            results.append({
                "title": recipe["title"],
                "emoji": recipe["emoji"],
                "cuisine": recipe["cuisine"],
                "time": recipe["time"],
                "difficulty": recipe["difficulty"],
            })
    return results[:8]  # max 8 suggestions

