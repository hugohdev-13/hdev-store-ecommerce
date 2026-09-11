"""Pruebas del flujo completo con sesiones en archivos aislados por prueba."""
from decimal import Decimal
from tempfile import TemporaryDirectory
from unittest.mock import patch
from django.contrib.sessions.backends.file import SessionStore

from django.conf import settings
from django.test import Client, TestCase, override_settings
from django.urls import resolve, reverse

from . import views


class VentasTests(TestCase):
    def setUp(self):
        carpeta = TemporaryDirectory()
        self.addCleanup(carpeta.cleanup)
        configuracion = override_settings(SESSION_FILE_PATH=carpeta.name)
        configuracion.enable()
        self.addCleanup(configuracion.disable)
        # Django conserva la ruta en la clase; aislarla también entre pruebas.
        ruta = patch.object(SessionStore, '_storage_path', carpeta.name, create=True)
        ruta.start()
        self.addCleanup(ruta.stop)
        self.datos = {
            "nombre": "Hugo Hernández", "correo": "hugo@example.com",
            "direccion": "Reforma 123, Centro", "ciudad": "Puebla",
            "codigo_postal": "72000",
        }

    def agregar(self, producto_id=1, cliente=None):
        return (cliente or self.client).post(
            reverse("ventas:agregar_carrito", args=[producto_id])
        )

    def test_catalogo_y_template(self):
        respuesta = self.client.get(reverse("ventas:lista_productos"))
        self.assertEqual(respuesta.status_code, 200)
        self.assertTemplateUsed(respuesta, "ventas/ventas.html")
        self.assertEqual(len(respuesta.context["productos"]), 6)
        for producto in views.PRODUCTOS:
            self.assertContains(respuesta, producto["nombre"])
        self.assertContains(respuesta, "MXN")

    def test_carrito_vacio(self):
        respuesta = self.client.get(reverse("ventas:ver_carrito"))
        self.assertEqual(respuesta.status_code, 200)
        self.assertTemplateUsed(respuesta, "ventas/carrito.html")
        self.assertContains(respuesta, "Tu carrito está vacío")
        self.assertEqual(respuesta.context["total"], Decimal("0.00"))

    def test_agregar_redirige_y_guarda_sesion_sin_consultas(self):
        self.assertEqual(settings.SESSION_ENGINE, "django.contrib.sessions.backends.file")
        with self.assertNumQueries(0):
            respuesta = self.agregar()
            self.assertRedirects(respuesta, reverse("ventas:ver_carrito"))
            self.assertEqual(self.client.session["carrito"], {"1": 1})

    def test_cantidades_subtotales_y_total(self):
        self.agregar()
        self.agregar()
        self.agregar(4)
        respuesta = self.client.get(reverse("ventas:ver_carrito"))
        self.assertEqual(self.client.session["carrito"], {"1": 2, "4": 1})
        self.assertEqual(respuesta.context["items"][0]["cantidad"], 2)
        self.assertEqual(respuesta.context["items"][0]["precio"], Decimal("15999.00"))
        self.assertEqual(respuesta.context["items"][0]["subtotal"], Decimal("31998.00"))
        self.assertEqual(respuesta.context["total"], Decimal("32697.00"))

    def test_eliminar_y_repetir_eliminacion(self):
        self.agregar()
        self.agregar(2)
        for _ in range(2):
            respuesta = self.client.post(reverse("ventas:eliminar_carrito", args=[1]))
            self.assertRedirects(respuesta, reverse("ventas:ver_carrito"))
        self.assertEqual(self.client.session["carrito"], {"2": 1})

    def test_producto_inexistente(self):
        for nombre in ["agregar_carrito", "eliminar_carrito"]:
            self.assertEqual(self.client.post(reverse(f"ventas:{nombre}", args=[999])).status_code, 404)
        self.assertNotIn("carrito", self.client.session)

    def test_mutaciones_requieren_post(self):
        self.agregar()
        for nombre in ["agregar_carrito", "eliminar_carrito"]:
            self.assertEqual(self.client.get(reverse(f"ventas:{nombre}", args=[1])).status_code, 405)
        self.assertEqual(self.client.session["carrito"], {"1": 1})

    def test_checkout_get(self):
        self.agregar()
        respuesta = self.client.get(reverse("ventas:procesar_pedido"))
        self.assertEqual(respuesta.status_code, 200)
        self.assertTemplateUsed(respuesta, "ventas/checkout.html")
        for campo in self.datos:
            self.assertContains(respuesta, f'name="{campo}"')
        self.assertContains(respuesta, "csrfmiddlewaretoken")
        self.assertContains(respuesta, "Resumen del pedido")

    def test_checkout_vacio_no_genera_pedido(self):
        for metodo in [self.client.get, self.client.post]:
            self.assertRedirects(metodo(reverse("ventas:procesar_pedido")), reverse("ventas:ver_carrito"))
        self.assertNotIn("pedido", self.client.session)

    def test_checkout_valida_todos_los_campos(self):
        self.agregar()
        for campo in self.datos:
            with self.subTest(campo=campo):
                respuesta = self.client.post(reverse("ventas:procesar_pedido"), {**self.datos, campo: " "})
                self.assertEqual(respuesta.status_code, 200)
                self.assertIn(campo, respuesta.context["formulario"].errors)
                self.assertNotIn("pedido", self.client.session)
                self.assertEqual(self.client.session["carrito"], {"1": 1})
        for campo, valor in [("correo", "correo-invalido"), ("codigo_postal", "12abc")]:
            respuesta = self.client.post(reverse("ventas:procesar_pedido"), {**self.datos, campo: valor})
            self.assertIn(campo, respuesta.context["formulario"].errors)

    def test_compra_conserva_pedido_tras_vaciar_y_recargar(self):
        self.agregar()
        self.agregar()
        self.agregar(4)
        with self.assertNumQueries(0):
            respuesta = self.client.post(reverse("ventas:procesar_pedido"), {**self.datos, "total": "1"})
            self.assertRedirects(respuesta, reverse("ventas:confirmacion_pedido"))
        pedido = self.client.session["pedido"]
        self.assertRegex(pedido["numero"], r"^HDEV-[0-9A-F]{12}$")
        self.assertEqual(pedido["cliente"], self.datos)
        self.assertEqual(pedido["total"], "32697.00")
        self.assertEqual(pedido["items"][0]["cantidad"], 2)
        self.assertEqual(self.client.session["carrito"], {})
        for _ in range(2):
            respuesta = self.client.get(reverse("ventas:confirmacion_pedido"))
            self.assertTemplateUsed(respuesta, "ventas/confirmacion.html")
            self.assertContains(respuesta, "¡Compra realizada correctamente!")
            self.assertContains(respuesta, "Hugo Hernández")
            self.assertEqual(respuesta.context["pedido"], pedido)
        self.agregar(2)
        self.assertEqual(self.client.session["pedido"], pedido)

    def test_reenvio_checkout_no_duplica_pedido(self):
        self.agregar()
        self.client.post(reverse("ventas:procesar_pedido"), self.datos)
        pedido = self.client.session["pedido"]
        self.assertRedirects(self.client.post(reverse("ventas:procesar_pedido"), self.datos), reverse("ventas:ver_carrito"))
        self.assertEqual(self.client.session["pedido"], pedido)

    def test_confirmacion_sin_pedido(self):
        self.assertRedirects(self.client.get(reverse("ventas:confirmacion_pedido")), reverse("ventas:lista_productos"))

    def test_sesiones_aisladas(self):
        self.agregar()
        otro = Client()
        self.assertEqual(otro.get(reverse("ventas:ver_carrito")).context["items"], [])
        self.client.post(reverse("ventas:procesar_pedido"), self.datos)
        self.assertRedirects(otro.get(reverse("ventas:confirmacion_pedido")), reverse("ventas:lista_productos"))

    def test_csrf_en_flujo_completo(self):
        cliente = Client(enforce_csrf_checks=True)
        cliente.get(reverse("ventas:lista_productos"))
        token = cliente.cookies["csrftoken"].value
        agregar = reverse("ventas:agregar_carrito", args=[1])
        self.assertEqual(cliente.post(agregar).status_code, 403)
        self.assertEqual(cliente.post(agregar, {"csrfmiddlewaretoken": token}).status_code, 302)
        self.assertEqual(cliente.post(reverse("ventas:eliminar_carrito", args=[1])).status_code, 403)
        checkout = reverse("ventas:procesar_pedido")
        self.assertEqual(cliente.post(checkout, self.datos).status_code, 403)
        self.assertRedirects(cliente.post(checkout, {**self.datos, "csrfmiddlewaretoken": token}), reverse("ventas:confirmacion_pedido"))

    def test_todas_las_urls_resuelven_a_sus_vistas(self):
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
        self.assertEqual(self.client.get("/no-existe/").status_code, 404)
