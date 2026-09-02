# RecipeAI — Django Backend

REST API backend for the AI Recipe Generator, built with **Django 5** and **Django REST Framework**.

---

## Quick Start

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
cp .env.example .env   # already created with a random SECRET_KEY

# 4. Apply migrations
python manage.py migrate

# 5. Seed popular recipes into the database
python manage.py seed_recipes

# 6. (Optional) Create an admin user
python manage.py createsuperuser

# 7. Start the development server
python manage.py runserver 8000
```

The API will be available at **https://ai-recipe-2wpn.vercel.app//api/**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health/` | Health check |
| `POST` | `/api/recipes/generate/` | Generate AI recipes |
| `GET` | `/api/recipes/popular/` | Get trending recipes |
| `GET` | `/api/recipes/saved/` | List saved recipes (session) |
| `POST` | `/api/recipes/saved/` | Save a recipe |
| `DELETE`| `/api/recipes/saved/<id>/` | Unsave a recipe |
| `GET` | `/admin/` | Django admin panel |

---

## Generate Recipes — Request Body

```json
POST /api/recipes/generate/
{
  "ingredients": ["chicken", "garlic", "tomatoes"],
  "cuisine": "Italian",
  "diet": "None",
  "mealType": "Dinner",
  "maxTime": 30,
  "difficulty": "Easy",
  "count": 3
}
```

---

## Adding HuggingFace AI

When you have a HuggingFace API key:

1. Add to `.env`:
   ```
   HUGGINGFACE_API_KEY=hf_your_key_here
   HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.2
   ```

2. Uncomment in `requirements.txt`:
   ```
   huggingface-hub==0.28.0
   ```

3. Implement `_huggingface_generate()` in `recipes/ai_service.py`
   (the stub is already there with full instructions).

---

## Admin Panel

Visit **https://ai-recipe-2wpn.vercel.app//admin/**

Login: `admin` / `admin123` *(change in production!)*

---

## Running Both Servers

```bash
# Terminal 1 — React frontend (port 5173)
cd "AI RECEPI GENERATOR"
npm run dev

# Terminal 2 — Django backend (port 8000)
cd "AI RECEPI GENERATOR/backend"
python manage.py runserver 8000
```
