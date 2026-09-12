from tempfile import TemporaryDirectory
from unittest.mock import patch
from uuid import uuid4

from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.sessions.backends.file import SessionStore
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from .forms import RegistroUsuarioForm


class RegistrationTests(TestCase):
    def setUp(self):
        carpeta = TemporaryDirectory()
        self.addCleanup(carpeta.cleanup)
        configuracion = override_settings(SESSION_FILE_PATH=carpeta.name)
        configuracion.enable()
        self.addCleanup(configuracion.disable)
        ruta = patch.object(SessionStore, "_storage_path", carpeta.name, create=True)
        ruta.start()
        self.addCleanup(ruta.stop)
        self.url = reverse("ventas:registro_usuario")
        clave = uuid4().hex
        self.datos = {
            "username": "registro_test", "first_name": "Nombre", "last_name": "Apellido",
            "email": " Persona@Example.COM ", "password1": clave, "password2": clave,
        }

    def test_get_template_formulario_y_csrf(self):
        respuesta = self.client.get(self.url)
        self.assertEqual(self.url, "/registro/")
        self.assertEqual(respuesta.status_code, 200)
        self.assertTemplateUsed(respuesta, "ventas/registro.html")
        self.assertIsInstance(respuesta.context["formulario"], RegistroUsuarioForm)
        self.assertFalse(respuesta.context["formulario"].is_bound)
        for campo in self.datos:
            self.assertContains(respuesta, f'name="{campo}"')
        self.assertContains(respuesta, 'name="csrfmiddlewaretoken"')

    def test_registro_hash_redireccion_mensaje_y_sin_login(self):
        respuesta = self.client.post(self.url, self.datos, follow=True)
        self.assertRedirects(respuesta, self.url)
        self.assertContains(respuesta, "Tu cuenta se creó correctamente.")
        usuario = User.objects.get(username=self.datos["username"])
        self.assertEqual(usuario.email, "persona@example.com")
        self.assertEqual(usuario.first_name, "Nombre")
        self.assertEqual(usuario.last_name, "Apellido")
        self.assertNotEqual(usuario.password, self.datos["password1"])
        self.assertTrue(usuario.check_password(self.datos["password1"]))
        self.assertFalse(usuario.is_staff)
        self.assertFalse(usuario.is_superuser)
        self.assertNotIn("_auth_user_id", self.client.session)
        self.assertFalse(respuesta.context["formulario"].is_bound)

    def test_claves_distintas_no_crean_usuario(self):
        respuesta = self.client.post(self.url, {**self.datos, "password2": uuid4().hex})
        self.assertIn("password2", respuesta.context["formulario"].errors)
        self.assertFalse(User.objects.exists())

    def test_username_duplicado(self):
        User.objects.create_user(username=self.datos["username"])
        respuesta = self.client.post(self.url, self.datos)
        self.assertIn("username", respuesta.context["formulario"].errors)
        self.assertEqual(User.objects.count(), 1)

    def test_email_duplicado_sin_distinguir_mayusculas(self):
        User.objects.create_user(username="existente", email="PERSONA@example.com")
        respuesta = self.client.post(self.url, self.datos)
        self.assertIn("email", respuesta.context["formulario"].errors)
        self.assertEqual(User.objects.count(), 1)

    def test_campos_invalidos_no_crean_usuarios(self):
        for campo, valor in [("email", ""), ("email", "invalido"), ("username", ""), ("password1", "")]:
            with self.subTest(campo=campo, valor=valor):
                respuesta = self.client.post(self.url, {**self.datos, campo: valor})
                self.assertEqual(respuesta.status_code, 200)
                self.assertTrue(respuesta.context["formulario"].errors)
                self.assertFalse(User.objects.exists())

    def test_csrf_rechaza_post_sin_token_y_acepta_token(self):
        cliente = Client(enforce_csrf_checks=True)
        cliente.get(self.url)
        self.assertEqual(cliente.post(self.url, self.datos).status_code, 403)
        self.assertFalse(User.objects.exists())
        token = cliente.cookies["csrftoken"].value
        self.assertRedirects(cliente.post(self.url, {**self.datos, "csrfmiddlewaretoken": token}), self.url)
        self.assertEqual(User.objects.count(), 1)

    def test_usuario_creado_disponible_en_admin(self):
        self.client.post(self.url, self.datos)
        usuario = User.objects.get(username=self.datos["username"])
        administrador = User.objects.create_superuser(username=uuid4().hex)
        self.client.force_login(administrador)
        self.assertTrue(admin.site.is_registered(User))
        respuesta = self.client.get(reverse("admin:auth_user_change", args=[usuario.pk]))
        self.assertEqual(respuesta.status_code, 200)
        self.assertContains(respuesta, usuario.username)

    def test_rutas_anteriores_y_navegacion(self):
        for nombre in ("lista_productos", "ver_carrito", "sales_chart", "sales_data"):
            self.assertEqual(self.client.get(reverse(f"ventas:{nombre}")).status_code, 200)
        self.assertContains(self.client.get(reverse("ventas:lista_productos")), 'href="/registro/"')
        self.assertEqual(self.client.put(self.url).status_code, 405)
