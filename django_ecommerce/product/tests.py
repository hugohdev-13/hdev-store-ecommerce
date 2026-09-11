from decimal import Decimal
from django.test import TestCase
from .models import Product


class ProductTests(TestCase):
    def test_crear_producto_y_recuperar_importe_exacto(self):
        producto = Product.objects.create(
            name="Laptop HDev Pro 14", description="Laptop para programar",
            price=Decimal("15999.95"),
        )
        guardado = Product.objects.get(pk=producto.pk)
        self.assertEqual(guardado.name, "Laptop HDev Pro 14")
        self.assertEqual(guardado.description, "Laptop para programar")
        self.assertEqual(guardado.price, Decimal("15999.95"))
        self.assertEqual(str(guardado), "Laptop HDev Pro 14")
