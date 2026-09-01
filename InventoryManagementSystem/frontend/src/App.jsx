import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/reset-password" element={<ResetPassword />} />

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />

  <Route
    path="/employee"
    element={
      <ProtectedRoute allowedRole="Employee">
        <EmployeeDashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/manager"
    element={
      <ProtectedRoute allowedRole="Manager">
        <ManagerDashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin"
    element={
      <ProtectedRoute allowedRole="Admin">
        <AdminDashboard />
      </ProtectedRoute>
    }
  />
</Routes>
    </BrowserRouter>
  )
}

export default App