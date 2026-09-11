from django import forms


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
