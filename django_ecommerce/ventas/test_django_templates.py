import re
from decimal import Decimal
from django.template.loader import render_to_string
from django.test import TestCase
from django.urls import resolve, reverse
from .views import django_templates_demo


class DjangoTemplatesTests(TestCase):
    def test_pagina_contexto_herencia_e_include(self):
        with self.assertNumQueries(0):
            respuesta = self.client.get(reverse("ventas:django_templates_demo"))
        self.assertEqual(respuesta.status_code, 200)
        for template in ("ventas/django_templates.html", "ventas/base.html", "ventas/includes/producto_card.html"):
            self.assertTemplateUsed(respuesta, template)
        self.assertEqual(respuesta.context["titulo"], "django templates")
        self.assertEqual(respuesta.context["subtitulo"], "Filtros, ciclos, herencia e include")
        self.assertEqual(len(respuesta.context["productos"]), 6)
        self.assertContains(respuesta, 'aria-label="Navegación principal"')
        self.assertContains(respuesta, "Total de productos: 6")
        for producto in respuesta.context["productos"]:
            self.assertContains(respuesta, producto["nombre"].upper())

    def test_posiciones_divisibles_primera_y_ultima(self):
        html = self.client.get(reverse("ventas:django_templates_demo")).content.decode()
        tarjetas = re.findall(r'<article[^>]*data-posicion="(\d+)"[^>]*>(.*?)</article>', html, re.S)
        self.assertEqual([numero for numero, _ in tarjetas], ["1", "2", "3", "4", "5", "6"])
        for numero, tarjeta in tarjetas:
            self.assertIn(f"Producto {numero}", tarjeta)
            self.assertEqual("Esta posición es divisible entre 3" in tarjeta, numero in ("3", "6"))
            self.assertEqual("Primer producto del listado" in tarjeta, numero == "1")
            self.assertEqual("Último producto del listado" in tarjeta, numero == "6")

    def test_filtros_de_texto(self):
        respuesta = self.client.get(reverse("ventas:django_templates_demo"))
        self.assertContains(respuesta, "Django Templates")
        self.assertContains(respuesta, "FILTROS, CICLOS, HERENCIA E INCLUDE")
        self.assertContains(respuesta, "filtros, ciclos, herencia e include")
        self.assertContains(respuesta, "Computadoras")
        self.assertContains(respuesta, "$24599.90 MXN")

    def test_include_aislado_truncamiento_y_variables(self):
        html = render_to_string("ventas/includes/producto_card.html", {
            "producto": {"nombre": "Producto", "descripcion": "A" * 60,
                         "precio": Decimal("12.50"), "categoria": "accesorios"},
            "numero": 9, "es_divisible": True, "primero": False, "ultimo": False,
        })
        self.assertIn("A" * 44 + "…", html)
        self.assertNotIn("A" * 60, html)
        self.assertIn("$12.50 MXN", html)
        self.assertIn("Producto 9", html)
        self.assertIn("Esta posición es divisible entre 3", html)

    def test_empty(self):
        html = render_to_string("ventas/django_templates.html", {
            "titulo": "django templates", "subtitulo": "Demostración", "productos": [],
        })
        self.assertIn("No hay productos de demostración disponibles.", html)
        self.assertIn("Total de productos: 0", html)
        self.assertNotIn("<article", html)

    def test_ruta_navegacion_y_paginas_anteriores(self):
        self.assertEqual(reverse("ventas:django_templates_demo"), "/templates-demo/")
        self.assertEqual(resolve("/templates-demo/").func, django_templates_demo)
        for nombre in ("lista_productos", "ver_carrito", "sales_chart", "sales_data", "registro_usuario"):
            self.assertEqual(self.client.get(reverse(f"ventas:{nombre}")).status_code, 200)
        self.assertContains(self.client.get("/"), 'href="/templates-demo/"')
