from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework.authtoken.models import Token


class AuthenticationAPITests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user_a = User.objects.create_user(
            username="usuario_a", password="clave_temporal_a", first_name="Ana",
            last_name="Prueba", email="ana@example.com",
        )
        cls.user_b = User.objects.create_user(
            username="usuario_b", password="clave_temporal_b", first_name="Beto",
            last_name="Prueba", email="beto@example.com",
        )

    def test_profile_requires_token(self):
        self.assertEqual(self.client.get(reverse("api_perfil")).status_code, 401)

    def test_each_user_can_obtain_token_and_only_own_profile(self):
        for user, password in ((self.user_a, "clave_temporal_a"), (self.user_b, "clave_temporal_b")):
            with self.subTest(username=user.username):
                response = self.client.post(reverse("api_token"), {
                    "username": user.username, "password": password,
                })
                self.assertEqual(response.status_code, 200)
                token = response.json()["token"]
                self.assertEqual(Token.objects.get(key=token).user_id, user.pk)
                profile = self.client.get(reverse("api_perfil"), HTTP_AUTHORIZATION=f"Token {token}")
                self.assertEqual(profile.status_code, 200)
                self.assertEqual(profile.json(), {
                    "id": user.pk, "username": user.username,
                    "first_name": user.first_name, "last_name": user.last_name,
                    "email": user.email,
                })

    def test_invalid_token_is_rejected(self):
        response = self.client.get(reverse("api_perfil"), HTTP_AUTHORIZATION="Token invalid")
        self.assertEqual(response.status_code, 401)

    def test_profile_is_read_only(self):
        token = Token.objects.create(user=self.user_a)
        for method in ("post", "put", "patch", "delete"):
            with self.subTest(method=method):
                response = getattr(self.client, method)(
                    reverse("api_perfil"), HTTP_AUTHORIZATION=f"Token {token.key}",
                )
                self.assertEqual(response.status_code, 405)

    def test_bad_credentials_do_not_issue_token(self):
        response = self.client.post(reverse("api_token"), {
            "username": self.user_a.username, "password": "incorrecta",
        })
        self.assertEqual(response.status_code, 400)
        self.assertNotIn("token", response.json())
        self.assertFalse(Token.objects.exists())

    def test_previous_routes_are_available(self):
        for url in ("api_productos", "ventas:registro_usuario",
                    "ventas:django_templates_demo", "ventas:sales_chart",
                    "ventas:lista_productos", "ventas:ver_carrito"):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(reverse(url)).status_code, 200)
