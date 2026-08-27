"""
Management command: seed_recipes

Populates the database with the built-in recipe knowledge base
and marks 4 of them as `is_popular=True` for the homepage.

Usage:
    python manage.py seed_recipes
    python manage.py seed_recipes --clear   (wipe and re-seed)
"""
from django.core.management.base import BaseCommand
from recipes.models import Recipe
from recipes.ai_service import RECIPE_DATABASE


class Command(BaseCommand):
    help = 'Seed the database with popular recipes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing recipes before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            deleted, _ = Recipe.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Deleted {deleted} existing recipes.'))

        # Popular recipe titles shown on homepage
        POPULAR_TITLES = {
            "Creamy Garlic Pasta",
            "Spicy Thai Basil Chicken",
            "Honey Garlic Salmon",
            "Butter Chicken",
            "Avocado & Mango Salad",
            "Black Bean Tacos",
            "Mushroom Risotto",
            "Margherita Pizza",
        }

        created_count = 0
        skipped_count = 0

        for data in RECIPE_DATABASE:
            # Skip already existing recipes (idempotent)
            if Recipe.objects.filter(title=data['title']).exists():
                skipped_count += 1
                continue

            Recipe.objects.create(
                title=data['title'],
                cuisine=data['cuisine'],
                time=data['time'],
                servings=data['servings'],
                difficulty=data['difficulty'],
                calories=data['calories'],
                rating=round(4.5 + (hash(data['title']) % 5) / 10, 1),  # 4.5–4.9
                emoji=data['emoji'],
                description=data['description'],
                tags=data['tags'],
                ingredients=data['ingredients'],
                steps=data['steps'],
                nutrition=data['nutrition'],
                is_popular=data['title'] in POPULAR_TITLES,
            )
            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Seeded {created_count} recipes. '
                f'Skipped {skipped_count} duplicates. '
                f'{Recipe.objects.filter(is_popular=True).count()} marked as popular.'
            )
        )
