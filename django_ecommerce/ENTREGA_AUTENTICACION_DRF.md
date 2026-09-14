# Autenticación en Django Rest Framework

## Objetivo

Permitir que cada usuario autenticado consulte exclusivamente su propio perfil.

## Tipo de autenticación elegido

Se usa `TokenAuthentication`, incluido en Django REST Framework y suficiente para esta actividad. El perfil exige además `IsAuthenticated`. No se utiliza JWT ni un paquete externo.

## Configuración

En `config/settings.py`, `INSTALLED_APPS` incluye `rest_framework.authtoken` una sola vez, junto a la entrada existente `rest_framework`. Se aplicaron las migraciones oficiales con `.\venv\Scripts\python.exe manage.py migrate`; no se crearon migraciones propias.

## Serializer del perfil

Código completo de `ventas/api_serializers.py`:

```python
from django.contrib.auth.models import User
from rest_framework import serializers


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email")
        read_only_fields = fields
```

La lista explícita de campos excluye contraseña, hash, permisos, grupos y tokens.

## Vista del perfil

Código completo de `ventas/api_views.py`:

```python
from rest_framework.authentication import TokenAuthentication
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from .api_serializers import UserProfileSerializer


class PerfilUsuarioAPIView(RetrieveAPIView):
    serializer_class = UserProfileSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
```

`authentication_classes` verifica el token; `permission_classes` exige autenticación. `get_object()` toma directamente `request.user`.

## URL para token

`POST /api/token/` usa `obtain_auth_token` oficial de DRF. Recibe `username` y `password`; con credenciales válidas devuelve un token.

## URL del perfil

`GET /api/perfil/` usa `PerfilUsuarioAPIView` y se llama `api_perfil`. Sin token o con uno inválido responde 401. Otros métodos responden 405 con autenticación válida.

## Flujo de autenticación

1. Enviar `POST /api/token/` con usuario y contraseña.
2. Enviar `Authorization: Token TOKEN_DEL_USUARIO` en `GET /api/perfil/`.
3. Consultar solamente los datos del usuario titular del token.

Ejemplo en PowerShell con valores de reemplazo (no guardar credenciales ni tokens reales en archivos):

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/token/" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"USUARIO","password":"CONTRASEÑA"}'

Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/perfil/" `
  -Headers @{Authorization="Token TOKEN_AQUI"}
```

Se puede usar una cuenta local existente o crear una mediante `/registro/`. El token debe mantenerse privado.

## Ejemplo de respuesta

Ejemplo ilustrativo, sin credenciales reales:

```json
{
  "id": 1,
  "username": "usuario_ejemplo",
  "first_name": "Usuario",
  "last_name": "Ejemplo",
  "email": "usuario@example.com"
}
```

## Protección del perfil

La URL no acepta `user_id`; tampoco se filtra por parámetros de consulta. El objeto devuelto siempre es `request.user`, derivado del token. El perfil no devuelve `password`, `is_superuser` ni el token. Los usuarios y tokens de las pruebas existen únicamente en la base temporal de pruebas.

## Pruebas realizadas

Se verificaron: acceso sin autenticación (401), obtención de token de usuarios A y B, perfiles separados, ausencia de campos sensibles, token inválido (401), credenciales incorrectas sin token, métodos POST/PUT/PATCH/DELETE (405) y continuidad de `/api/productos/`, `/registro/`, `/templates-demo/`, gráfica, catálogo y carrito.

## Resultados de validación

Desde `django_ecommerce/`:

- `.\venv\Scripts\python.exe manage.py check`: `System check identified no issues (0 silenced).`
- `.\venv\Scripts\python.exe manage.py makemigrations --check`: `No changes detected`.
- `.\venv\Scripts\python.exe manage.py test`: 65 pruebas, `OK`.
- `.\venv\Scripts\python.exe manage.py showmigrations authtoken`: `0001_initial`, `0002_auto_20160226_1747`, `0003_tokenproxy` y `0004_alter_tokenproxy_options` aplicadas (`[X]`).

## Repositorio

https://github.com/hugohdev-13/hdev-store-ecommerce

## Commit

El commit final deberá llamarse exactamente **Autenticación en Django Rest Framework**. Codex no ejecutó `git add`, `git commit` ni `git push`.

## Limitaciones

Los tokens nativos de DRF no caducan automáticamente; quien administre una cuenta debe custodiar o revocar su token cuando corresponda. El frontend React conserva su autenticación simulada independiente y no consume esta API.
