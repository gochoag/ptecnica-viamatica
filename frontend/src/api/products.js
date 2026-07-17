import api from './client'

export function getProducts(page = 1) {
  return api.get('/products/', { params: { page } }).then((res) => res.data)
}
