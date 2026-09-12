from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class PedidoForm(forms.Form):
    nombre = forms.CharField(label="Nombre", max_length=100)
    correo = forms.EmailField(label="Correo electrónico", max_length=254)
    direccion = forms.CharField(label="Dirección", max_length=200)
    ciudad = forms.CharField(label="Ciudad", max_length=100)
    codigo_postal = forms.RegexField(
        label="Código postal", regex=r"^[0-9]{5}$", max_length=5,
        error_messages={"invalid": "Escribe un código postal de cinco dígitos."},
        widget=forms.TextInput(attrs={"inputmode": "numeric", "autocomplete": "postal-code"}),
    )


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
