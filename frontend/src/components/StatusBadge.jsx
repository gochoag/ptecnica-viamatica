const styles = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
}

const labels = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  FAILED: 'Fallido',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}
    >
      {labels[status] ?? status}
    </span>
  )
}
