import { Navigate, useLocation } from 'react-router-dom'
import { getAccessToken } from '../api/tokenStorage'

export default function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
