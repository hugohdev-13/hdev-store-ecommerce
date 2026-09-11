from decimal import Decimal
from django.contrib.auth.models import User
from django.test import TestCase
from product.models import Product
from .models import Cart


class CartTests(TestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(username="hugo")
        self.carrito = Cart.objects.create(user=self.usuario)
        self.producto = Product.objects.create(
            name="Mouse HDev Precision", description="Mouse inalámbrico",
            price=Decimal("699.00"),
        )

    def test_usuario_y_productos_many_to_many(self):
        otro = Product.objects.create(
            name="HDev Key Pro", description="Teclado mecánico", price=Decimal("1299.00"),
        )
        self.carrito.products.add(self.producto, otro)
        carrito = Cart.objects.get(pk=self.carrito.pk)
        self.assertEqual(carrito.user, self.usuario)
        self.assertCountEqual(carrito.products.all(), [self.producto, otro])
        self.assertEqual(str(carrito), f"Carrito {carrito.pk} de hugo")
        segundo = Cart.objects.create(user=self.usuario)
        segundo.products.add(self.producto)
        self.assertCountEqual(self.producto.cart_set.all(), [carrito, segundo])
        self.assertCountEqual(self.usuario.cart_set.all(), [carrito, segundo])
        carrito.products.remove(self.producto)
        self.assertTrue(segundo.products.filter(pk=self.producto.pk).exists())
        self.assertTrue(Product.objects.filter(pk=self.producto.pk).exists())

    def test_borrar_usuario_elimina_carritos_sin_eliminar_productos(self):
        self.carrito.products.add(self.producto)
        self.usuario.delete()
        self.assertFalse(Cart.objects.exists())
        self.assertTrue(Product.objects.filter(pk=self.producto.pk).exists())
