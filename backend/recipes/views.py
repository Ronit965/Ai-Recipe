"""
Recipe API Views
================

Endpoints:
  POST   /api/recipes/generate/      — AI recipe generation
  POST   /api/recipes/lookup/        — Look up recipe by name → ingredients
  GET    /api/recipes/search/        — Autocomplete recipe name search
  GET    /api/recipes/popular/       — Trending recipes (for homepage)
  GET    /api/recipes/saved/         — User's saved recipes (session-based)
  POST   /api/recipes/saved/         — Save a recipe
  DELETE /api/recipes/saved/<id>/    — Unsave a recipe
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Recipe, SavedRecipe
from .serializers import (
    RecipeSerializer,
    GenerateRecipeSerializer,
    SavedRecipeSerializer,
)
from .ai_service import generate_recipes, lookup_recipe_by_name, search_recipes_by_name
from .mongo_service import (
    log_recipe_generation_to_mongo,
    save_recipe_to_mongo,
    get_popular_recipes_from_mongo,
    is_mongodb_available,
)


# ─────────────────────────────────────────────────────────────────────────────
# Recipe Lookup by Name
# ─────────────────────────────────────────────────────────────────────────────

class RecipeLookupView(APIView):
    """
    POST /api/recipes/lookup/

    Body: { "name": "Butter Chicken", "filters": {...} }
    Returns full recipe details including structured ingredients list.
    """

    def post(self, request):
        name = request.data.get('name', '').strip()
        filters = request.data.get('filters', {})
        if not name:
            return Response(
                {"error": "'name' field is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        recipe = lookup_recipe_by_name(name, filters)
        if not recipe:
            return Response(
                {"found": False, "message": f"No recipe found for '{name}'. Try a different name."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Remove internal alias field before returning
        recipe.pop('aliases', None)
        return Response({"found": True, "recipe": recipe}, status=status.HTTP_200_OK)


class RecipeSearchView(APIView):
    """
    GET /api/recipes/search/?q=butter

    Returns up to 8 autocomplete suggestions matching the query.
    """

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        suggestions = search_recipes_by_name(q)
        return Response({"suggestions": suggestions}, status=status.HTTP_200_OK)


def _get_or_create_session(request):
    """Ensure session exists and return its key."""
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


# ─────────────────────────────────────────────────────────────────────────────
# Recipe Generation
# ─────────────────────────────────────────────────────────────────────────────

class GenerateRecipeView(APIView):
    """
    POST /api/recipes/generate/

    Body (JSON):
    {
        "ingredients": ["chicken", "garlic", "tomatoes"],
        "cuisine": "Italian",
        "diet": "None",
        "mealType": "Dinner",
        "maxTime": 30,
        "difficulty": "Easy",
        "count": 3
    }

    Returns a list of generated recipe objects.
    """

    def post(self, request):
        serializer = GenerateRecipeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid parameters", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        params = serializer.validated_data

        # Call AI service
        recipes = generate_recipes(
            ingredients=params.get('ingredients', []),
            cuisine=params.get('cuisine', 'Any'),
            diet=params.get('diet', 'None'),
            meal_type=params.get('meal_type', 'Any'),
            max_time=params.get('max_time', 0),
            difficulty=params.get('difficulty', 'Any'),
            count=params.get('count', 3),
        )

        # Log AI generation to MongoDB for analytics & history
        ip = request.META.get('REMOTE_ADDR')
        log_recipe_generation_to_mongo(params, recipes, ip_address=ip)

        return Response({"recipes": recipes, "count": len(recipes)}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# Popular Recipes
# ─────────────────────────────────────────────────────────────────────────────

class PopularRecipesView(APIView):
    """
    GET /api/recipes/popular/

    Returns popular/trending recipes seeded to the database.
    Used on the homepage "Trending This Week" section.
    """

    def get(self, request):
        limit = int(request.query_params.get('limit', 8))
        recipes = Recipe.objects.filter(is_popular=True).order_by('-rating')[:limit]
        if recipes.count() < 4:
            # If not enough marked popular, take top rated recipes
            recipes = Recipe.objects.all().order_by('-rating')[:limit]
        serializer = RecipeSerializer(recipes, many=True)
        return Response({"recipes": serializer.data}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# Saved Recipes
# ─────────────────────────────────────────────────────────────────────────────

class SavedRecipesView(APIView):
    """
    GET  /api/recipes/saved/   — list saved recipes for this session
    POST /api/recipes/saved/   — save a recipe by recipe_id

    The body for POST:
    { "recipe_id": 1 }
    """

    def get(self, request):
        session_key = _get_or_create_session(request)
        saved = SavedRecipe.objects.filter(session_key=session_key).select_related('recipe')
        serializer = SavedRecipeSerializer(saved, many=True)
        return Response({"saved_recipes": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        session_key = _get_or_create_session(request)
        recipe_id = request.data.get('recipe_id')

        if not recipe_id:
            return Response(
                {"error": "recipe_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            recipe = Recipe.objects.get(pk=recipe_id)
        except Recipe.DoesNotExist:
            return Response(
                {"error": f"Recipe with id={recipe_id} not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Toggle: if already saved, unsave it
        existing = SavedRecipe.objects.filter(recipe=recipe, session_key=session_key).first()
        if existing:
            existing.delete()
            return Response(
                {"message": "Recipe removed from saved", "saved": False},
                status=status.HTTP_200_OK,
            )

        SavedRecipe.objects.create(recipe=recipe, session_key=session_key)
        serializer = RecipeSerializer(recipe)
        return Response(
            {"message": "Recipe saved successfully", "saved": True, "recipe": serializer.data},
            status=status.HTTP_201_CREATED,
        )


class SavedRecipeDetailView(APIView):
    """
    DELETE /api/recipes/saved/<id>/  — remove a specific saved recipe entry
    """

    def delete(self, request, pk):
        session_key = _get_or_create_session(request)
        try:
            saved = SavedRecipe.objects.get(pk=pk, session_key=session_key)
        except SavedRecipe.DoesNotExist:
            return Response(
                {"error": "Saved recipe not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        saved.delete()
        return Response({"message": "Recipe removed from saved"}, status=status.HTTP_204_NO_CONTENT)
