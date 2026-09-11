from django.contrib import admin
from .models import BillingProfile


@admin.register(BillingProfile)
class BillingProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "address")
    search_fields = ("user__username", "address__street")
