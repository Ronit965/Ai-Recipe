from django.contrib import admin
from .models import Recipe, SavedRecipe


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ['emoji', 'title', 'cuisine', 'difficulty', 'time', 'calories', 'rating', 'is_popular', 'created_at']
    list_filter = ['cuisine', 'difficulty', 'is_popular']
    search_fields = ['title', 'description', 'cuisine']
    list_editable = ['is_popular', 'rating']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'cuisine', 'emoji', 'description', 'difficulty', 'time', 'servings')
        }),
        ('Nutrition & Rating', {
            'fields': ('calories', 'rating', 'nutrition', 'tags')
        }),
        ('Recipe Content', {
            'fields': ('ingredients', 'steps')
        }),
        ('Metadata', {
            'fields': ('is_popular', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(SavedRecipe)
class SavedRecipeAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'session_key', 'saved_at']
    list_filter = ['saved_at']
    search_fields = ['recipe__title', 'session_key']
    readonly_fields = ['saved_at']
    ordering = ['-saved_at']
