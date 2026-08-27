from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from recipes.models import Recipe

class AuthAndRecipeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recipe = Recipe.objects.create(
            title="Test Pasta",
            cuisine="Italian",
            time=20,
            servings=2,
            difficulty="Easy",
            calories=350,
            rating=4.8,
            emoji="🍝",
            description="Tasty pasta",
            tags=["pasta"],
            ingredients=["pasta", "tomato"],
            steps=["Boil", "Serve"],
            nutrition={"protein": "10g"},
            is_popular=True
        )

    def test_popular_recipes(self):
        response = self.client.get('/api/recipes/popular/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['recipes']), 1)
        self.assertEqual(response.data['recipes'][0]['title'], "Test Pasta")

    def test_user_registration_and_login(self):
        # Register
        reg_data = {
            "name": "Chef John",
            "email": "chef@example.com",
            "password": "securepassword123"
        }
        res_reg = self.client.post('/api/auth/register/', reg_data, format='json')
        self.assertEqual(res_reg.status_code, 201)
        self.assertEqual(res_reg.data['user']['email'], "chef@example.com")
        self.assertIn('access_token', res_reg.cookies)

        # Me endpoint with cookie
        self.client.cookies['access_token'] = res_reg.cookies['access_token'].value
        res_me = self.client.get('/api/auth/me/')
        self.assertEqual(res_me.status_code, 200)
        self.assertEqual(res_me.data['user']['name'], "Chef John")

        # Login
        login_data = {
            "email": "chef@example.com",
            "password": "securepassword123"
        }
        res_login = self.client.post('/api/auth/login/', login_data, format='json')
        self.assertEqual(res_login.status_code, 200)
        self.assertEqual(res_login.data['user']['email'], "chef@example.com")

    def test_recipe_generation(self):
        gen_data = {
            "ingredients": ["chicken", "garlic"],
            "cuisine": "Any",
            "diet": "None",
            "mealType": "Dinner",
            "maxTime": 45,
            "difficulty": "Easy",
            "count": 2
        }
        response = self.client.post('/api/recipes/generate/', gen_data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue('recipes' in response.data)
        self.assertGreaterEqual(len(response.data['recipes']), 1)

