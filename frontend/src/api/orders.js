import api from './client'

export function getOrders({ status = '', page = 1 } = {}) {
  const params = { page }
  if (status) params.status = status
  return api.get('/orders/', { params }).then((res) => res.data)
}

export function createOrder(items) {
  return api.post('/orders/', { items }).then((res) => res.data)
}
