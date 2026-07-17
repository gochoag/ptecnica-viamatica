from rest_framework import serializers

from accounts.serializers import UserSerializer
from catalog.models import Product

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_sku', 'product_name',
            'quantity', 'unit_price', 'subtotal',
        ]
        read_only_fields = ['id', 'unit_price']

    def get_subtotal(self, obj):
        return obj.quantity * obj.unit_price


class OrderItemCreateSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'created_at', 'items', 'total_amount']
        read_only_fields = fields

    def get_total_amount(self, obj):
        return sum((item.quantity * item.unit_price for item in obj.items.all()), start=0)


class OrderCreateSerializer(serializers.Serializer):
    items = OrderItemCreateSerializer(many=True, allow_empty=False)

    def validate_items(self, items):
        product_ids = [item['product'].id for item in items]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError(
                'No se puede repetir el mismo producto en varias líneas del pedido.'
            )
        return items
