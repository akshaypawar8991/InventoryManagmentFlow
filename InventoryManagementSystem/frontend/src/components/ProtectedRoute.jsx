import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, allowedRole }) {
  const userData = localStorage.getItem('user')

  if (!userData) {
    return <Navigate to="/" replace />
  }

  const user = JSON.parse(userData)

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute