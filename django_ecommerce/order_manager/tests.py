from decimal import Decimal
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.test import TestCase
from django.utils import timezone
from cart.models import Cart
from .models import Order


class OrderTests(TestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(username="hugo")
        self.carrito = Cart.objects.create(user=self.usuario)

    def test_crear_pedido_total_fecha_y_relacion(self):
        antes = timezone.now()
        pedido = Order.objects.create(cart=self.carrito, total=Decimal("1999.95"))
        despues = timezone.now()
        guardado = Order.objects.get(pk=pedido.pk)
        self.assertEqual(guardado.cart, self.carrito)
        self.assertEqual(self.carrito.order, guardado)
        self.assertEqual(guardado.total, Decimal("1999.95"))
        self.assertLessEqual(antes, guardado.created_at)
        self.assertLessEqual(guardado.created_at, despues)
        self.assertEqual(str(guardado), f"Pedido {pedido.pk} — carrito {self.carrito.pk}")
        guardado.total = Decimal("2000.00")
        guardado.save()
        guardado.refresh_from_db()
        self.assertEqual(guardado.created_at, pedido.created_at)

    def test_un_solo_pedido_por_carrito(self):
        Order.objects.create(cart=self.carrito, total=Decimal("699.00"))
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Order.objects.create(cart=self.carrito, total=Decimal("699.00"))
        self.assertEqual(Order.objects.count(), 1)

    def test_borrar_carrito_elimina_pedido_y_conserva_usuario(self):
        Order.objects.create(cart=self.carrito, total=Decimal("699.00"))
        self.carrito.delete()
        self.assertFalse(Order.objects.exists())
        self.assertTrue(User.objects.filter(pk=self.usuario.pk).exists())
