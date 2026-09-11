"""Integración del Admin con los modelos existentes, sin credenciales persistentes."""
from decimal import Decimal
from tempfile import TemporaryDirectory
from unittest.mock import patch
from uuid import uuid4

from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.sessions.backends.file import SessionStore
from django.test import TestCase, override_settings
from django.urls import resolve, reverse

from address.models import Address
from billing_profile.models import BillingProfile
from cart.models import Cart
from order_manager.models import Order
from product.models import Product
from ventas import views


class AdminTests(TestCase):
    modelos = (Product, Address, BillingProfile, Cart, Order)

    def setUp(self):
        carpeta = TemporaryDirectory()
        self.addCleanup(carpeta.cleanup)
        configuracion = override_settings(SESSION_FILE_PATH=carpeta.name)
        configuracion.enable()
        self.addCleanup(configuracion.disable)
        # El backend conserva la ruta en la clase; aislarla también entre pruebas.
        ruta = patch.object(SessionStore, "_storage_path", carpeta.name, create=True)
        ruta.start()
        self.addCleanup(ruta.stop)
        self.usuario = User.objects.create_superuser(username=uuid4().hex)
        self.client.force_login(self.usuario)

    def test_cinco_modelos_registrados(self):
        for modelo in self.modelos:
            with self.subTest(modelo=modelo.__name__):
                self.assertTrue(admin.site.is_registered(modelo))

    def test_indice_admin_con_permisos(self):
        respuesta = self.client.get(reverse("admin:index"))
        self.assertEqual(respuesta.status_code, 200)
        self.assertTemplateUsed(respuesta, "admin/index.html")
        for modelo in self.modelos:
            opciones = modelo._meta
            self.assertContains(respuesta, reverse(
                f"admin:{opciones.app_label}_{opciones.model_name}_changelist"
            ))

    def test_listados_y_formularios_de_los_cinco_modelos(self):
        for modelo in self.modelos:
            opciones = modelo._meta
            for accion in ("changelist", "add"):
                with self.subTest(modelo=modelo.__name__, accion=accion):
                    respuesta = self.client.get(reverse(
                        f"admin:{opciones.app_label}_{opciones.model_name}_{accion}"
                    ))
                    self.assertEqual(respuesta.status_code, 200)

    def test_admin_anonimo_redirige_a_login(self):
        self.client.logout()
        self.assertRedirects(
            self.client.get(reverse("admin:index")),
            reverse("admin:login") + "?next=/admin/",
        )

    def test_usuario_sin_staff_no_accede(self):
        usuario = User.objects.create_user(username=uuid4().hex)
        self.client.force_login(usuario)
        self.assertRedirects(
            self.client.get(reverse("admin:index")),
            reverse("admin:login") + "?next=/admin/",
        )

    def test_staff_sin_permiso_no_accede_a_productos(self):
        usuario = User.objects.create_user(username=uuid4().hex, is_staff=True)
        self.client.force_login(usuario)
        respuesta = self.client.get(reverse("admin:product_product_changelist"))
        self.assertEqual(respuesta.status_code, 403)

    def test_crear_producto_desde_admin(self):
        respuesta = self.client.post(reverse("admin:product_product_add"), {
            "name": "Producto de prueba", "description": "Registro temporal del test",
            "price": "123.45", "_save": "1",
        })
        self.assertRedirects(respuesta, reverse("admin:product_product_changelist"))
        producto = Product.objects.get(name="Producto de prueba")
        self.assertEqual(producto.price, Decimal("123.45"))
        self.assertEqual(producto.description, "Registro temporal del test")

    def test_urls_ventas_conservadas(self):
        rutas = [
            ("lista_productos", [], "/"),
            ("ver_carrito", [], "/carrito/"),
            ("agregar_carrito", [1], "/carrito/agregar/1/"),
            ("eliminar_carrito", [1], "/carrito/eliminar/1/"),
            ("procesar_pedido", [], "/checkout/"),
            ("confirmacion_pedido", [], "/confirmacion/"),
        ]
        for nombre, args, ruta in rutas:
            with self.subTest(ruta=ruta):
                self.assertEqual(reverse(f"ventas:{nombre}", args=args), ruta)
                self.assertEqual(resolve(ruta).func, getattr(views, nombre))
        self.assertEqual(self.client.get("/").status_code, 200)
        self.assertEqual(self.client.get("/carrito/").status_code, 200)
