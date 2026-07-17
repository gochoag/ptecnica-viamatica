from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics

from core.responses import r201, r400

from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer
from .services import InsufficientStockError, create_order


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .prefetch_related('items__product')
        )

    def post(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return r400(serializer.errors)

        try:
            order = create_order(user=request.user, items=serializer.validated_data['items'])
        except InsufficientStockError as exc:
            return r400(str(exc))

        return r201(OrderSerializer(order).data)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .prefetch_related('items__product')
        )
