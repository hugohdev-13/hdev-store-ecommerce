from rest_framework.authentication import TokenAuthentication
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from .api_serializers import UserProfileSerializer
from .api_serializers import RegistrationSerializer, OrderInputSerializer
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from decimal import Decimal
from product.models import Product
from cart.models import Cart
from order_manager.models import Order
from address.models import Address
from billing_profile.models import BillingProfile


class PerfilUsuarioAPIView(RetrieveAPIView):
    serializer_class = UserProfileSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class RegistroAPIView(CreateAPIView):
    serializer_class = RegistrationSerializer


class OrderCreateAPIView(CreateAPIView):
    serializer_class = OrderInputSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        quantities = {line['product_id']: line['quantity'] for line in data['items']}
        with transaction.atomic():
            products = list(Product.objects.select_for_update().filter(id__in=quantities, available=True))
            if len(products) != len(quantities) or any(p.stock < quantities[p.id] for p in products):
                return Response({'detail': 'Producto inexistente, agotado o cantidad superior al stock.'}, status=400)
            total = sum((p.price * quantities[p.id] for p in products), Decimal('0.00'))
            shipping = data['address']
            address = Address.objects.create(
                street=shipping['street'], city=shipping['city'], state=shipping['state'],
                country=shipping.get('country', 'México'), postal_code=shipping['postal_code'],
            )
            BillingProfile.objects.create(user=request.user, address=address)
            cart = Cart.objects.create(user=request.user)
            cart.products.set(products)
            order = Order.objects.create(cart=cart, total=total)
            for product in products:
                product.stock -= quantities[product.id]
                product.save(update_fields=['stock'])
        return Response({'id': order.id, 'created_at': order.created_at, 'total': str(order.total)}, status=status.HTTP_201_CREATED)
