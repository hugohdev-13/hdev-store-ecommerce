from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework.authtoken.models import Token

from address.models import Address
from billing_profile.models import BillingProfile
from cart.models import Cart
from order_manager.models import Order
from product.models import Product


class StoreApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='buyer@example.com', password='Secret123!')
        self.token = Token.objects.create(user=self.user)
        self.product = Product.objects.create(name='Equipo', price=Decimal('100.00'), stock=3)

    def test_registration_uses_django_password_hash(self):
        response = self.client.post(reverse('api_registro'), {
            'username': 'new@example.com', 'email': 'new@example.com',
            'first_name': 'Nueva', 'last_name': 'Cuenta', 'password': 'Secret123!'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username='new@example.com')
        self.assertTrue(user.check_password('Secret123!'))
        self.assertNotIn('password', response.json())

    def test_order_requires_token_and_recalculates_total(self):
        payload = {'items': [{'product_id': self.product.pk, 'quantity': 2}],
                   'address': {'street': 'Reforma 1', 'city': 'Puebla', 'state': 'Puebla',
                               'postal_code': '72000'}}
        url = reverse('api_ordenes')
        self.assertEqual(self.client.post(url, payload, content_type='application/json').status_code, 401)
        response = self.client.post(url, payload, content_type='application/json',
                                    HTTP_AUTHORIZATION=f'Token {self.token.key}')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['total'], '200.00')
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(Cart.objects.count(), 1)
        self.assertEqual(Address.objects.count(), 1)
        self.assertEqual(BillingProfile.objects.count(), 1)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

    def test_order_rejects_out_of_stock_without_side_effects(self):
        response = self.client.post(reverse('api_ordenes'), {
            'items': [{'product_id': self.product.pk, 'quantity': 4}],
            'address': {'street': 'Reforma 1', 'city': 'Puebla', 'state': 'Puebla',
                        'postal_code': '72000'}}, content_type='application/json',
            HTTP_AUTHORIZATION=f'Token {self.token.key}')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)


class CatalogFixtureTests(TestCase):
    fixtures = ['store_catalog']

    def test_catalog_contains_existing_frontend_products(self):
        self.assertEqual(Product.objects.count(), 8)
        self.assertEqual(Product.objects.get(pk=1).name, 'HDev Pro 14')
