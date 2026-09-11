from django.test import TestCase
from django.urls import resolve, reverse
from .views import SalesDataView


class SalesChartTests(TestCase):
    def test_pagina_template_canvas_y_scripts(self):
        respuesta = self.client.get(reverse("ventas:sales_chart"))
        self.assertEqual(respuesta.status_code, 200)
        self.assertTemplateUsed(respuesta, "ventas/sales_chart.html")
        self.assertContains(respuesta, 'id="salesChart"')
        self.assertContains(respuesta, 'data-url="/ventas/datos/"')
        self.assertContains(respuesta, "https://cdn.jsdelivr.net/npm/chart.js")
        self.assertContains(respuesta, "/static/ventas/js/sales_chart.js")
        self.assertContains(respuesta, "Datos de demostración")

    def test_json_demostrativo_sin_consultas(self):
        with self.assertNumQueries(0):
            respuesta = self.client.get(reverse("ventas:sales_data"))
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.headers["Content-Type"], "application/json")
        data = respuesta.json()
        self.assertEqual(data["labels"], ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"])
        self.assertEqual(data["sales"], [12000, 18500, 14300, 22100, 19800, 26500])
        self.assertEqual(len(data["labels"]), len(data["sales"]))

    def test_rechaza_post_put_patch_delete(self):
        for ruta in ("sales_data", "sales_chart"):
            for metodo in ("post", "put", "patch", "delete"):
                with self.subTest(ruta=ruta, metodo=metodo):
                    respuesta = getattr(self.client, metodo)(reverse(f"ventas:{ruta}"))
                    self.assertEqual(respuesta.status_code, 405)

    def test_rutas_y_enlace_desde_catalogo(self):
        self.assertEqual(reverse("ventas:sales_chart"), "/ventas/grafica/")
        self.assertEqual(reverse("ventas:sales_data"), "/ventas/datos/")
        self.assertEqual(resolve("/ventas/datos/").func.view_class, SalesDataView)
        self.assertContains(self.client.get(reverse("ventas:lista_productos")), '/ventas/grafica/')
        self.assertEqual(self.client.get(reverse("ventas:ver_carrito")).status_code, 200)
