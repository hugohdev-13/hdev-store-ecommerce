from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    fields = ("name", "description", "price")
    list_display = ("id", "name", "price")
    search_fields = ("name",)
