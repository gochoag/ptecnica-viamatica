export function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`
}

export function formatDate(value) {
  return new Date(value).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
