# Forms

## Objetivo

Crear un formulario de registro de usuarios dentro de la aplicación ventas existente,
conservando el checkout, Admin, Gráfica de Ventas y frontend React.

## ModelForm

RegistroUsuarioForm hereda de django.contrib.auth.forms.UserCreationForm. Este es
un ModelForm especializado para User: vincula campos con el modelo y agrega la
confirmación de contraseña y el guardado mediante set_password. La clase declara
Meta.model = User y los seis campos solicitados. Se conserva PedidoForm.

## Archivos creados

- `django_ecommerce/ventas/templates/ventas/registro.html`.
- `django_ecommerce/ventas/test_registration.py`.
- `django_ecommerce/ENTREGA_FORMS.md`.

## Archivos modificados

- `django_ecommerce/ventas/forms.py`.
- `django_ecommerce/ventas/views.py`.
- `django_ecommerce/ventas/urls.py`.
- `django_ecommerce/ventas/templates/ventas/base.html`.
- `README.md`, conservando las secciones y cambios previos.

No se modificaron modelos, migraciones, configuración, React ni pruebas anteriores.

## Código completo de RegistroUsuarioForm

```python
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class RegistroUsuarioForm(UserCreationForm):
    email = forms.EmailField(label="Correo electrónico", required=True, max_length=254)

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "password1", "password2")
        labels = {
            "username": "Nombre de usuario",
            "first_name": "Nombre",
            "last_name": "Apellidos",
        }

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("Ya existe una cuenta con este correo electrónico.")
        return email
```

## Vista registro_usuario

```python
from django.contrib import messages
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods
from .forms import RegistroUsuarioForm

@require_http_methods(["GET", "POST"])
def registro_usuario(request):
    formulario = RegistroUsuarioForm(request.POST if request.method == "POST" else None)
    if request.method == "POST" and formulario.is_valid():
        formulario.save()
        messages.success(request, "Tu cuenta se creó correctamente.")
        return redirect("ventas:registro_usuario")
    return render(request, "ventas/registro.html", {"formulario": formulario})
```

## Ruta

En ventas/urls.py, con el namespace ventas y conservando todas las rutas:

```python
path("registro/", views.registro_usuario, name="registro_usuario"),
```

En la navegación de base.html se agregó:

```html
<a href="{% url 'ventas:registro_usuario' %}">Registrarse</a>
```

## Plantilla completa registro.html

```html
{% extends 'ventas/base.html' %} {% block title %}Registro de usuario | HDev Store{% endblock %} {%
block content %}
<h1>Registro de usuario</h1>
<p class="intro">Crea tu cuenta en HDev Store.</p>
{% for message in messages %}
<p class="panel" role="status">{{ message }}</p>
{% endfor %}
<section class="panel" style="max-width: 640px; overflow-wrap: anywhere;">
  <form method="post">
    {% csrf_token %} {% if formulario.errors %}
    <p class="error" role="alert">Revisa los campos indicados.</p>
    {% endif %} {{ formulario.as_p }}
    <button type="submit">Crear cuenta</button>
  </form>
</section>
{% endblock %}
```

## CSRF y contraseñas

El formulario usa POST y csrf_token. El middleware CSRF existente comprueba el token;
una prueba con Client(enforce_csrf_checks=True) confirma 403 sin token y registro
correcto al enviarlo. No se utiliza csrf_exempt.

UserCreationForm compara password1 y password2 y su save() utiliza set_password.
La base almacena una representación con hash y salt, nunca la contraseña en texto
plano. Las pruebas verifican que el valor guardado es distinto y check_password()
acepta la contraseña original. Los campos de contraseña no se vuelven a rellenar
al mostrar errores. Se conserva la configuración de validadores existente.

El formulario rechaza username duplicado y correo repetido con email__iexact,
normalizando el correo mediante strip().lower(). Un formulario inválido no llama
save(). No se crea una sesión autenticada ni se conceden permisos staff/superuser.

## Pruebas realizadas

Antes de modificar pasaron las 38 pruebas anteriores. Se añadieron nueve pruebas:

1. GET 200, plantilla, formulario vacío, seis campos y token CSRF.
2. POST válido, datos guardados, email normalizado, hash, check_password, mensaje, redirección y ausencia de login y privilegios.
3. Contraseñas diferentes: no crea usuario.
4. Username duplicado: no crea otro usuario.
5. Email duplicado con diferentes mayúsculas: no crea otro usuario.
6. Campos vacíos o inválidos: no crea usuarios.
7. Protección CSRF efectiva: rechazo sin token y aceptación con token.
8. Usuario registrado consultable en el UserAdmin estándar por un administrador temporal.
9. Catálogo, carrito, gráfica, JSON, enlace de registro y rechazo de PUT.

Se ejecutan en una base de pruebas y carpetas de sesiones temporales. No se guardaron
cuentas ni contraseñas de prueba en la base local. Se generaron contraseñas aleatorias
para las pruebas. Las 38 pruebas anteriores permanecen intactas.

## Resultados de validación

Ejecutados desde django_ecommerce con el Python del entorno virtual:

```text
python manage.py check
System check identified no issues (0 silenced).

python manage.py makemigrations --check
No changes detected

python manage.py test
Found 47 test(s).
Ran 47 tests
OK
```

En Microsoft Edge se abrió /registro/, se verificaron los seis campos y la ausencia
de desbordamiento horizontal a 375 y 1440 píxeles. Capturas locales ignoradas por Git:
`test-results/registro-375.png` y `test-results/registro-1440.png` en la raíz.
La creación, mensaje de éxito y consulta en Admin se verificaron mediante el cliente
de pruebas Django, sin crear cuentas persistentes desde el navegador.

## Prueba manual y Django Admin

1. Desde django_ecommerce ejecutar `.\venv\Scripts\python.exe manage.py runserver`.
2. Abrir http://127.0.0.1:8000/registro/ o pulsar Registrarse en la navegación.
3. Completar usuario, nombre, apellidos, correo y las dos contraseñas iguales.
4. Pulsar Crear cuenta y comprobar el mensaje de éxito y el formulario limpio.
5. Repetir con el mismo usuario o correo y comprobar que aparecen errores.
6. Abrir http://127.0.0.1:8000/admin/ e iniciar sesión con un administrador existente.
7. En Usuarios, buscar el usuario creado y comprobar nombre, apellidos y correo.
8. Si no existe administrador, crearlo manualmente con `python manage.py createsuperuser`
   usando el entorno virtual. No guardar sus credenciales en documentación ni Git.

Para una instalación nueva, instalar requirements.txt y ejecutar migrate como se
explica en el README. Esta actividad no agrega migraciones.

## Repositorio y commit

https://github.com/hugohdev-13/hdev-store-ecommerce

El commit final deberá llamarse exactamente **Forms**.
No se ejecutaron git add, git commit ni git push.

## Limitaciones

- No se inicia sesión automáticamente, ni se añade login público o verificación por correo.
- Nombre y apellidos conservan el carácter opcional del modelo User; email es obligatorio.
- La unicidad del email se valida en el formulario, no mediante una restricción de la BD.
  Operaciones concurrentes o creación directa desde Admin/ORM pueden producir duplicados.
- Se usa la configuración existente de contraseñas; no se agregan reglas nuevas de fortaleza.
- React mantiene su registro simulado independiente.
- Falta realizar la prueba humana si se desea, preparar el PDF y entregarlo.
