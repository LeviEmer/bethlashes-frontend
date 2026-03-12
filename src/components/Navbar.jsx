import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-rose-soft shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={isAdmin() ? '/dashboard' : '/mis-citas'}>
          <h1 className="font-display text-2xl font-bold text-rose-dark">BETHLASHES</h1>
        </Link>

        <div className="flex items-center gap-4">
          {!isAdmin() && (
            <Link to="/agendar" className="text-sm text-gray-600 hover:text-rose-dark font-medium transition">
              Agendar cita
            </Link>
          )}
          <span className="text-sm text-gray-500 hidden sm:block">
            Hola, <span className="font-semibold text-rose-dark">{user?.nombre}</span>
          </span>
          <button onClick={handleLogout} className="btn-secondary text-sm py-1 px-4">
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
