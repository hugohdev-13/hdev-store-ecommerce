from django.test import TestCase
from .models import Address


class AddressTests(TestCase):
    def test_crear_direccion_y_recuperar_todos_los_campos(self):
        datos = {
            "street": "Reforma 123", "city": "Puebla", "state": "Puebla",
            "country": "México", "postal_code": "01234",
        }
        direccion = Address.objects.create(**datos)
        guardada = Address.objects.get(pk=direccion.pk)
        for campo, valor in datos.items():
            with self.subTest(campo=campo):
                self.assertEqual(getattr(guardada, campo), valor)
        self.assertEqual(str(guardada), "Reforma 123, Puebla")
