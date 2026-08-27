"""
Management command: seed_mongo
==============================
Seeds MongoDB 'recipes' collection from the built-in RECIPE_DATABASE knowledge base.

Usage:
    python manage.py seed_mongo
    python manage.py seed_mongo --clear
"""
from django.core.management.base import BaseCommand
from core.mongodb import check_mongo_connection, get_mongo_collection
from recipes.ai_service import RECIPE_DATABASE
from recipes.mongo_service import save_recipe_to_mongo


class Command(BaseCommand):
    help = 'Seed the MongoDB database with recipe data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing MongoDB recipes collection before seeding',
        )

    def handle(self, *args, **options):
        connected, msg = check_mongo_connection()
        if not connected:
            self.stdout.write(
                self.style.ERROR(
                    f"❌ Cannot connect to MongoDB: {msg}\n"
                    f"Please ensure MongoDB server is running (e.g. `brew services start mongodb-community` or check your MONGODB_URI in .env)."
                )
            )
            return

        col = get_mongo_collection('recipes')

        if options['clear']:
            deleted = col.delete_many({}).deleted_count
            self.stdout.write(self.style.WARNING(f"Cleared {deleted} documents from MongoDB 'recipes' collection."))

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

        count = 0
        for data in RECIPE_DATABASE:
            recipe_doc = dict(data)
            recipe_doc['is_popular'] = data.get('title') in POPULAR_TITLES
            recipe_doc['rating'] = round(4.5 + (hash(data.get('title', '')) % 5) / 10, 1)
            save_recipe_to_mongo(recipe_doc)
            count += 1

        total_in_db = col.count_documents({})
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Successfully seeded {count} recipes into MongoDB!\n"
                f"📊 Total recipe documents in MongoDB: {total_in_db}"
            )
        )
