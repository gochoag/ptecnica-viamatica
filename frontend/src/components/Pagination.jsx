export default function Pagination({ page, hasNext, hasPrevious, onPageChange }) {
  if (!hasNext && !hasPrevious && page === 1) return null

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevious}
        className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Anterior
      </button>
      <span className="text-gray-500">Página {page}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Siguiente
      </button>
    </div>
  )
}
