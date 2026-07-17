import logging
import random
import time

from celery import shared_task
from django.db import transaction

from catalog.models import Product

from .models import Order

logger = logging.getLogger(__name__)
# esto es el valor de probailidad de que un pago sea exitoso, para simular pagos fallidos
PAYMENT_SUCCESS_RATE = 0.85


@shared_task
def verify_payment(order_id):
    """    
    Aqui simulo la verificación de pago si es exitosa o no, y si es exitosa, verifico que el stock alcance y lo descuenta.
    """
    
    # hago una pausa aleatoria pq los pagos no se verifican instantáneamente y quiero simularlo
    time.sleep(random.uniform(2, 5))
    payment_approved = random.random() < PAYMENT_SUCCESS_RATE

    try:
        with transaction.atomic():
            order = Order.objects.select_for_update().get(id=order_id)

            if order.status != Order.Status.PENDING:
                logger.info('Pedido #%s ya fue procesado, se ignora la tarea.', order_id)
                return

            if not payment_approved:
                order.status = Order.Status.FAILED
                order.save(update_fields=['status'])
                logger.info('Pago rechazado para el pedido #%s.', order_id)
                return

            for item in order.items.select_related('product'):
                product = Product.objects.select_for_update().get(pk=item.product_id)
                if product.stock_quantity < item.quantity:
                    order.status = Order.Status.FAILED
                    order.save(update_fields=['status'])
                    logger.warning(
                        'Stock insuficiente al confirmar el pedido #%s (producto %s).',
                        order_id, product.sku,
                    )
                    return
                product.stock_quantity -= item.quantity
                product.save(update_fields=['stock_quantity'])

            order.status = Order.Status.CONFIRMED
            order.save(update_fields=['status'])
    except Exception:
        logger.exception('Error inesperado verificando el pago del pedido #%s.', order_id)
        Order.objects.filter(id=order_id).update(status=Order.Status.FAILED)
        return

    if order.status == Order.Status.CONFIRMED:
        send_order_confirmation.delay(order.id)


@shared_task
def send_order_confirmation(order_id):
    """Simulo el envio de un correo al cliente lo muestro en el log."""
    try:
        order = Order.objects.select_related('user').get(id=order_id)
    except Order.DoesNotExist:
        logger.warning('No se encontró el pedido #%s para notificar.', order_id)
        return

    total = sum(item.quantity * item.unit_price for item in order.items.all())
    logger.info(
        'Email simulado enviado a %s: tu pedido #%s fue confirmado. Total: $%s',
        order.user.email, order.id, total,
    )
