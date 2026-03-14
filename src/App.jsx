import Dashboard from './pages/admin/Dashboard'
import GestionSlots from './pages/admin/GestionSlots'
import GestionUsuarios from './pages/admin/GestionUsuarios'
import GestionServicios from './pages/admin/GestionServicios'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import MisCitas from './pages/client/MisCitas'
import Agendar from './pages/client/Agendar'

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-rose-light flex items-center justify-center">
      <p className="text-rose-dark font-display text-2xl">BETHLASHES 🌸</p>
    </div>
  )
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.rol)) return <Navigate to="/login" />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mis-citas" element={
        <ProtectedRoute roles={['CLIENT']}>
          <MisCitas />
        </ProtectedRoute>
      }/>
      <Route path="/agendar" element={
        <ProtectedRoute roles={['CLIENT']}>
          <Agendar />
        </ProtectedRoute>
      }/>
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['ADMIN_OPERATOR', 'ADMIN_DEV']}>
          <Dashboard />
        </ProtectedRoute>
      }/>
      <Route path="/slots" element={
        <ProtectedRoute roles={['ADMIN_DEV']}>
          <GestionSlots />
        </ProtectedRoute>
      }/>
      <Route path="/usuarios" element={
        <ProtectedRoute roles={['ADMIN_OPERATOR', 'ADMIN_DEV']}>
          <GestionUsuarios />
        </ProtectedRoute>
      }/>
      <Route path="/servicios" element={
        <ProtectedRoute roles={['ADMIN_DEV']}>
          <GestionServicios />
        </ProtectedRoute>
      }/>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
