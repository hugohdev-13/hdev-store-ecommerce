from django.contrib.auth.models import User
from django.test import TestCase
from address.models import Address
from .models import BillingProfile


class BillingProfileTests(TestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(username="hugo")
        self.direccion = Address.objects.create(
            street="Reforma 123", city="Puebla", state="Puebla",
            country="México", postal_code="72000",
        )
        self.perfil = BillingProfile.objects.create(
            user=self.usuario, address=self.direccion,
        )

    def test_relaciones_y_representacion(self):
        perfil = BillingProfile.objects.get(pk=self.perfil.pk)
        self.assertEqual(perfil.user, self.usuario)
        self.assertEqual(perfil.address, self.direccion)
        self.assertEqual(str(perfil), "Perfil de facturación de hugo — Reforma 123, Puebla")
        segundo = BillingProfile.objects.create(user=self.usuario, address=self.direccion)
        self.assertCountEqual(self.usuario.billingprofile_set.all(), [perfil, segundo])
        self.assertCountEqual(self.direccion.billingprofile_set.all(), [perfil, segundo])

    def test_borrar_usuario_elimina_perfil_y_conserva_direccion(self):
        self.usuario.delete()
        self.assertFalse(BillingProfile.objects.exists())
        self.assertTrue(Address.objects.filter(pk=self.direccion.pk).exists())

    def test_borrar_direccion_elimina_perfil_y_conserva_usuario(self):
        self.direccion.delete()
        self.assertFalse(BillingProfile.objects.exists())
        self.assertTrue(User.objects.filter(pk=self.usuario.pk).exists())
