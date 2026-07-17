import { useEffect, useState } from 'react'
import { getProducts } from '../api/products'
import { createOrder } from '../api/orders'
import { extractErrorMessage } from '../api/errors'
import { formatCurrency } from '../utils/format'
import { CloseIcon } from '../components/icons'
import Pagination from '../components/Pagination'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ next: null, previous: null })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [quantities, setQuantities] = useState({})
  const [cart, setCart] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState('')

  useEffect(() => {
    loadProducts(page)
  }, [page])

  function loadProducts(pageToLoad) {
    setLoading(true)
    setLoadError('')
    getProducts(pageToLoad)
      .then((data) => {
        setProducts(data.results)
        setPagination({ next: data.next, previous: data.previous })
      })
      .catch((err) => setLoadError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  function handleQuantityChange(productId, value, max) {
    const qty = Math.min(Math.max(1, Number(value) || 1), max)
    setQuantities((prev) => ({ ...prev, [productId]: qty }))
  }

  function handleAddToCart(product) {
    const qty = quantities[product.id] ?? 1
    setOrderSuccess('')
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: qty } : item
        )
      }
      return [...prev, { product, quantity: qty }]
    })
  }

  function handleRemoveFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const total = cart.reduce((sum, item) => sum + item.quantity * Number(item.product.price), 0)

  async function handleCreateOrder() {
    setSubmitting(true)
    setOrderError('')
    setOrderSuccess('')
    try {
      const order = await createOrder(
        cart.map((item) => ({ product: item.product.id, quantity: item.quantity }))
      )
      setCart([])
      setOrderSuccess(
        `Pedido #${order.id} creado. Quedó en estado "Pendiente"; revisa el avance en Mis pedidos.`
      )
    } catch (err) {
      setOrderError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2">
        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
            Cargando productos...
          </div>
        )}

        {!loading && loadError && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-red-600 text-sm mb-3">{loadError}</p>
            <button
              onClick={() => loadProducts(page)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => {
                const outOfStock = product.stock_quantity === 0
                const qty = quantities[product.id] ?? 1

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col"
                  >
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">{product.sku}</p>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-blue-600 font-bold mt-1">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {outOfStock ? 'Sin stock' : `Stock disponible: ${product.stock_quantity}`}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={product.stock_quantity}
                        value={qty}
                        disabled={outOfStock}
                        onChange={(e) =>
                          handleQuantityChange(product.id, e.target.value, product.stock_quantity)
                        }
                        className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={outOfStock}
                        className="flex-1 bg-blue-600 text-white text-sm font-medium py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <Pagination
              page={page}
              hasNext={Boolean(pagination.next)}
              hasPrevious={Boolean(pagination.previous)}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 lg:sticky lg:top-6">
        <h3 className="font-semibold text-gray-900 mb-3">Tu pedido</h3>

        {cart.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no agregaste productos.</p>
        ) : (
          <>
            <ul className="space-y-3 mb-4">
              {cart.map((item) => (
                <li key={item.product.id} className="flex items-start justify-between text-sm gap-2">
                  <div>
                    <p className="text-gray-900">{item.product.name}</p>
                    <p className="text-gray-500">
                      {item.quantity} x {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.quantity * Number(item.product.price))}
                    </span>
                    <button
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-200 pt-3 flex items-center justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </>
        )}

        {orderError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {orderError}
          </div>
        )}

        {orderSuccess && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {orderSuccess}
          </div>
        )}

        <button
          onClick={handleCreateOrder}
          disabled={cart.length === 0 || submitting}
          className="mt-4 w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Enviando...' : 'Confirmar pedido'}
        </button>
      </div>
    </div>
  )
}
