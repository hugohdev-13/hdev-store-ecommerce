from decimal import Decimal

from django.test import TestCase
from django.urls import reverse

from .models import Product


class ProductPaginationTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.products = [Product.objects.create(
            name=f"Producto {number}", description="Prueba",
            price=Decimal("10.00"),
        ) for number in range(12)]

    def test_default_page_and_response_fields(self):
        response = self.client.get(reverse("api_productos"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(set(data), {
            "total", "pagina_actual", "total_paginas", "siguiente",
            "anterior", "resultados",
        })
        self.assertEqual((data["total"], data["pagina_actual"], data["total_paginas"]), (12, 1, 3))
        self.assertEqual(len(data["resultados"]), 4)
        self.assertEqual([item["id"] for item in data["resultados"]],
                         [product.pk for product in self.products[:4]])
        self.assertIsNone(data["anterior"])
        self.assertIn("pagina=2", data["siguiente"])

    def test_second_page_has_stable_order(self):
        data = self.client.get(reverse("api_productos"), {"pagina": 2}).json()
        self.assertEqual([item["id"] for item in data["resultados"]],
                         [product.pk for product in self.products[4:8]])
        self.assertEqual(data["pagina_actual"], 2)
        self.assertIsNotNone(data["anterior"])

    def test_custom_page_size(self):
        data = self.client.get(reverse("api_productos"), {"pagina": 1, "tamano": 2}).json()
        self.assertEqual(len(data["resultados"]), 2)
        self.assertEqual(data["total_paginas"], 6)

    def test_page_size_is_capped_at_ten(self):
        data = self.client.get(reverse("api_productos"), {"pagina": 1, "tamano": 100}).json()
        self.assertEqual(len(data["resultados"]), 10)
        self.assertEqual(data["total_paginas"], 2)

    def test_nonexistent_page_uses_drf_404(self):
        response = self.client.get(reverse("api_productos"), {"pagina": 99})
        self.assertEqual(response.status_code, 404)
        self.assertIn("detail", response.json())

    def test_post_is_not_allowed(self):
        self.assertEqual(self.client.post(reverse("api_productos")).status_code, 405)
