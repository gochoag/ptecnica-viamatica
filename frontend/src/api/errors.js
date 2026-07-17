// El backend no siempre responde con la misma forma de error: simplejwt usa
// {detail}, nuestras vistas propias usan {message, status}. Este helper
// normaliza ambas para mostrar un solo mensaje legible en la UI.
export function extractErrorMessage(error) {
  const data = error.response?.data

  if (!data) {
    return 'No se pudo conectar con el servidor. Intenta de nuevo.'
  }

  if (typeof data.detail === 'string') {
    return data.detail
  }

  if (data.message) {
    if (typeof data.message === 'string') {
      return data.message
    }
    const firstFieldErrors = Object.values(data.message)[0]
    if (Array.isArray(firstFieldErrors)) {
      return firstFieldErrors[0]
    }
    return 'Revisa los datos ingresados.'
  }

  return 'Ocurrió un error inesperado.'
}
