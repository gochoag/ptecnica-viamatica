from django.db import transaction

from catalog.models import Product

from .models import Order, OrderItem
from .tasks import verify_payment


class InsufficientStockError(Exception):
    def __init__(self, product):
        self.product = product
        super().__init__(
            f'Stock insuficiente para el producto "{product.name}" '
            f'(disponible: {product.stock_quantity}).'
        )


@transaction.atomic
def create_order(user, items):
    """
    Aqui creo el pedido y sus items, verificando que haya stock suficiente en ese momento.
    Luego lanzo la tarea de Celery para verificar el pago y descontar el stock si es exitoso.
    
    """
    order = Order.objects.create(user=user, status=Order.Status.PENDING)

    order_items = []
    for entry in items:
        product = Product.objects.select_for_update().get(pk=entry['product'].pk)
        quantity = entry['quantity']
        if product.stock_quantity < quantity:
            raise InsufficientStockError(product)
        order_items.append(
            OrderItem(order=order, product=product, quantity=quantity, unit_price=product.price)
        )

    OrderItem.objects.bulk_create(order_items)
    transaction.on_commit(lambda: verify_payment.delay(order.id))
    return order
