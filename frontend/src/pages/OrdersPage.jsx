import { useEffect, useState } from 'react'
import { getOrders } from '../api/orders'
import { extractErrorMessage } from '../api/errors'
import { formatCurrency, formatDate } from '../utils/format'
import StatusBadge from '../components/StatusBadge'
import Pagination from '../components/Pagination'

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'FAILED', label: 'Fallido' },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ next: null, previous: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [status, page])

  function loadOrders() {
    setLoading(true)
    setError('')
    getOrders({ status, page })
      .then((data) => {
        setOrders(data.results)
        setPagination({ next: data.next, previous: data.previous })
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  function handleStatusChange(value) {
    setStatus(value)
    setPage(1)
  }

  function toggleExpand(orderId) {
    setExpandedId((prev) => (prev === orderId ? null : orderId))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Refrescar
        </button>
      </div>

      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          Cargando pedidos...
        </div>
      )}

      {!loading && error && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={loadOrders}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          No tienes pedidos con este filtro todavía.
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left"
                >
                  <div>
                    <p className="font-semibold text-gray-900">Pedido #{order.id}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </button>

                {expandedId === order.id && (
                  <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                    <ul className="space-y-1 text-sm">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between text-gray-600">
                          <span>
                            {item.quantity} x {item.product_name}
                          </span>
                          <span>{formatCurrency(item.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
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
  )
}
