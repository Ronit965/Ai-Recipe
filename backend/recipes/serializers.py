from rest_framework import serializers
from .models import Recipe, SavedRecipe


class RecipeSerializer(serializers.ModelSerializer):
    """Full recipe serializer — matches the frontend Recipe schema exactly."""

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'cuisine', 'time', 'servings', 'difficulty',
            'calories', 'rating', 'emoji', 'description',
            'tags', 'ingredients', 'steps', 'nutrition',
            'is_popular', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class RecipeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views (no steps, no nutrition)."""

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'cuisine', 'time', 'servings', 'difficulty',
            'calories', 'rating', 'emoji', 'description', 'tags', 'is_popular',
        ]


class GenerateRecipeSerializer(serializers.Serializer):
    """Validates the /generate/ POST body from the React frontend."""

    ingredients = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
        default=list,
        allow_empty=True,
    )
    cuisine = serializers.CharField(max_length=50, default='Any', required=False)
    diet = serializers.CharField(max_length=50, default='None', required=False)
    meal_type = serializers.CharField(source='mealType', max_length=50, default='Any', required=False)
    max_time = serializers.IntegerField(source='maxTime', default=0, required=False, min_value=0)
    difficulty = serializers.CharField(max_length=20, default='Any', required=False)
    count = serializers.IntegerField(default=3, required=False, min_value=1, max_value=6)

    def to_internal_value(self, data):
        """Accept both camelCase (from React) and snake_case keys."""
        # Normalise camelCase → snake_case for known fields
        normalised = {}
        for key, val in data.items():
            if key == 'mealType':
                normalised['meal_type'] = val
            elif key == 'maxTime':
                normalised['max_time'] = val
            else:
                normalised[key] = val
        return super().to_internal_value(normalised)


class SavedRecipeSerializer(serializers.ModelSerializer):
    """Returns the full nested recipe when listing saved recipes."""

    recipe = RecipeSerializer(read_only=True)
    recipe_id = serializers.PrimaryKeyRelatedField(
        queryset=Recipe.objects.all(),
        source='recipe',
        write_only=True,
    )

    class Meta:
        model = SavedRecipe
        fields = ['id', 'recipe', 'recipe_id', 'saved_at']
        read_only_fields = ['id', 'saved_at']
