from django.contrib import admin
from .models import Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("id", "street", "city", "state", "country", "postal_code")
    search_fields = ("street", "city", "postal_code")
