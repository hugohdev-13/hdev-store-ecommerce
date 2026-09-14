"""Configuración local para la actividad académica, sin servicios externos."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
# Valor exclusivo de desarrollo. Para un despliegue se debe configurar el entorno.
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-hdev-actividad-local")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

INSTALLED_APPS = [
    "rest_framework",
    "rest_framework.authtoken",
    "django.contrib.admin",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "ventas.apps.VentasConfig",
    "order_manager.apps.OrderManagerConfig",
    "address.apps.AddressConfig",
    "billing_profile.apps.BillingProfileConfig",
    "cart.apps.CartConfig",
    "product.apps.ProductConfig",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"
# SQLite local conserva los modelos de la actividad entre ejecuciones.
DATABASES = {"default": {
    "ENGINE": "django.db.backends.sqlite3",
    "NAME": BASE_DIR / "db.sqlite3",
}}

# El carrito y el último pedido viven en archivos del servidor, no en la BD.
SESSION_ENGINE = "django.contrib.sessions.backends.file"
SESSION_FILE_PATH = BASE_DIR / ".sessions"
SESSION_FILE_PATH.mkdir(exist_ok=True)
SESSION_COOKIE_NAME = "hdev_django_session"
SESSION_COOKIE_AGE = 60 * 60
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
LANGUAGE_CODE = "es-mx"
TIME_ZONE = "America/Mexico_City"
USE_I18N = True
USE_TZ = True
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
