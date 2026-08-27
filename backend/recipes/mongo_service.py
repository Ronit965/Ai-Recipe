"""
MongoDB Recipe Service
======================
Handles CRUD and logging operations on MongoDB collections:
  - recipes: Stored recipe documents
  - saved_recipes: User/session saved recipe documents
  - recipe_logs: Generation prompt and response tracking
"""
import datetime
import logging
from core.mongodb import get_mongo_collection, check_mongo_connection

logger = logging.getLogger(__name__)


def is_mongodb_available():
    """Check if MongoDB is currently connected and accessible."""
    connected, _ = check_mongo_connection()
    return connected


# ── Recipe Document Operations ────────────────────────────────────────────────

def save_recipe_to_mongo(recipe_data):
    """
    Insert or update a recipe document in MongoDB 'recipes' collection.
    Returns the document or None if MongoDB is unavailable.
    """
    col = get_mongo_collection('recipes')
    if col is None:
        return None

    doc = {
        "title": recipe_data.get("title"),
        "cuisine": recipe_data.get("cuisine", "Any"),
        "time": recipe_data.get("time", 30),
        "servings": recipe_data.get("servings", 2),
        "difficulty": recipe_data.get("difficulty", "Easy"),
        "calories": recipe_data.get("calories", 0),
        "rating": recipe_data.get("rating", 4.8),
        "emoji": recipe_data.get("emoji", "🍽️"),
        "description": recipe_data.get("description", ""),
        "tags": recipe_data.get("tags", []),
        "ingredients": recipe_data.get("ingredients", []),
        "steps": recipe_data.get("steps", []),
        "nutrition": recipe_data.get("nutrition", {}),
        "is_popular": recipe_data.get("is_popular", False),
        "updated_at": datetime.datetime.now(datetime.timezone.utc),
    }

    try:
        col.update_one(
            {"title": doc["title"]},
            {"$set": doc, "$setOnInsert": {"created_at": datetime.datetime.now(datetime.timezone.utc)}},
            upsert=True,
        )
        return doc
    except Exception as e:
        logger.error(f"Error saving recipe to MongoDB: {e}")
        return None


def get_popular_recipes_from_mongo(limit=8):
    """
    Fetch popular / trending recipes from MongoDB.
    Returns a list of clean dicts (with string _id).
    """
    col = get_mongo_collection('recipes')
    if col is None:
        return []

    try:
        cursor = col.find({"is_popular": True}).sort("rating", -1).limit(limit)
        results = list(cursor)
        if len(results) < 4:
            cursor = col.find({}).sort("rating", -1).limit(limit)
            results = list(cursor)

        clean = []
        for r in results:
            r['id'] = str(r.pop('_id'))
            clean.append(r)
        return clean
    except Exception as e:
        logger.error(f"Error fetching popular recipes from MongoDB: {e}")
        return []


def search_recipes_in_mongo(query, limit=8):
    """
    Full-text / regex search for recipes in MongoDB by title or tags.
    """
    col = get_mongo_collection('recipes')
    if col is None:
        return []

    try:
        filter_query = {
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"cuisine": {"$regex": query, "$options": "i"}},
                {"tags": {"$regex": query, "$options": "i"}},
            ]
        }
        cursor = col.find(filter_query).limit(limit)
        clean = []
        for r in cursor:
            r['id'] = str(r.pop('_id'))
            clean.append(r)
        return clean
    except Exception as e:
        logger.error(f"Error searching recipes in MongoDB: {e}")
        return []


# ── AI Generation Logging ─────────────────────────────────────────────────────

def log_recipe_generation_to_mongo(prompt_params, generated_recipes, ip_address=None):
    """
    Store an audit log entry of user inputs and generated recipe results.
    """
    col = get_mongo_collection('recipe_logs')
    if col is None:
        return None

    entry = {
        "params": prompt_params,
        "recipe_count": len(generated_recipes),
        "recipes_generated": [
            {
                "title": r.get("title"),
                "cuisine": r.get("cuisine"),
                "time": r.get("time"),
                "difficulty": r.get("difficulty"),
            }
            for r in generated_recipes
        ],
        "ip_address": ip_address,
        "timestamp": datetime.datetime.now(datetime.timezone.utc),
    }

    try:
        res = col.insert_one(entry)
        return str(res.inserted_id)
    except Exception as e:
        logger.error(f"Error logging recipe generation to MongoDB: {e}")
        return None


# ── Saved Recipes in MongoDB ──────────────────────────────────────────────────

def save_recipe_for_user_in_mongo(user_identifier, recipe_data):
    """
    Save a recipe bookmark in MongoDB under saved_recipes collection.
    """
    col = get_mongo_collection('saved_recipes')
    if col is None:
        return False

    doc = {
        "user_identifier": str(user_identifier),
        "recipe": recipe_data,
        "saved_at": datetime.datetime.now(datetime.timezone.utc),
    }

    try:
        col.update_one(
            {"user_identifier": str(user_identifier), "recipe.title": recipe_data.get("title")},
            {"$set": doc},
            upsert=True,
        )
        return True
    except Exception as e:
        logger.error(f"Error saving user recipe in MongoDB: {e}")
        return False


def get_saved_recipes_from_mongo(user_identifier):
    """
    Retrieve all saved recipes for a user/session from MongoDB.
    """
    col = get_mongo_collection('saved_recipes')
    if col is None:
        return []

    try:
        cursor = col.find({"user_identifier": str(user_identifier)}).sort("saved_at", -1)
        results = []
        for doc in cursor:
            recipe = doc.get("recipe", {})
            recipe['saved_at'] = doc.get("saved_at")
            recipe['mongo_id'] = str(doc.get('_id'))
            results.append(recipe)
        return results
    except Exception as e:
        logger.error(f"Error retrieving saved recipes from MongoDB: {e}")
        return []
