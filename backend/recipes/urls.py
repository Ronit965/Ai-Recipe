from django.urls import path
from .views import (
    GenerateRecipeView,
    RecipeLookupView,
    RecipeSearchView,
    PopularRecipesView,
    SavedRecipesView,
    SavedRecipeDetailView,
)

urlpatterns = [
    # AI Generation
    path('recipes/generate/', GenerateRecipeView.as_view(), name='recipe-generate'),

    # Recipe Name → Ingredients Lookup
    path('recipes/lookup/', RecipeLookupView.as_view(), name='recipe-lookup'),
    path('recipes/search/', RecipeSearchView.as_view(), name='recipe-search'),

    # Popular / Trending
    path('recipes/popular/', PopularRecipesView.as_view(), name='recipe-popular'),

    # Saved Recipes (session-based)
    path('recipes/saved/', SavedRecipesView.as_view(), name='saved-recipes'),
    path('recipes/saved/<int:pk>/', SavedRecipeDetailView.as_view(), name='saved-recipe-detail'),
]
