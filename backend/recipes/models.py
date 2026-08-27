from django.db import models


class Recipe(models.Model):
    """Stores a generated or popular recipe."""

    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    title = models.CharField(max_length=255)
    cuisine = models.CharField(max_length=100, default='Any')
    time = models.PositiveIntegerField(help_text='Cooking time in minutes')
    servings = models.PositiveIntegerField(default=2)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Easy')
    calories = models.PositiveIntegerField(default=0)
    rating = models.FloatField(default=4.5)
    emoji = models.CharField(max_length=10, default='🍽️')
    description = models.TextField()

    # JSON fields
    tags = models.JSONField(default=list)
    ingredients = models.JSONField(default=list)
    steps = models.JSONField(default=list)
    nutrition = models.JSONField(default=dict, help_text='{"protein": "20g", "carbs": "30g", "fat": "10g", "fiber": "5g"}')

    # Metadata
    is_popular = models.BooleanField(default=False, help_text='Show on homepage trending section')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Recipe'
        verbose_name_plural = 'Recipes'

    def __str__(self):
        return f"{self.emoji} {self.title} ({self.cuisine})"


class SavedRecipe(models.Model):
    """Tracks recipes saved by a user (session-based, no auth required)."""

    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='saves')
    session_key = models.CharField(max_length=40, db_index=True)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('recipe', 'session_key')
        ordering = ['-saved_at']
        verbose_name = 'Saved Recipe'
        verbose_name_plural = 'Saved Recipes'

    def __str__(self):
        return f"Saved: {self.recipe.title} (session: {self.session_key[:8]}...)"
