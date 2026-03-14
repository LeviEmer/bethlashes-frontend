import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function Login() {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    mode: 'onChange'
  })
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      login(res.data)
      toast.success(`¡Bienvenida, ${res.data.nombre}! 🌸`)
      const rol = res.data.rol
      if (rol === 'CLIENT') navigate('/mis-citas')
      else navigate('/dashboard')
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message
      const status = e.response?.status
      const isWrongCredentials = status === 401 || status === 403 ||
        (msg && (String(msg).includes('Credenciales incorrectas') || String(msg).includes('Usuario inactivo')))
      if (e.code === 'ERR_NETWORK' || !e.response) {
        toast.error('No se pudo conectar al servidor. Revisa que el backend esté en marcha y CORS configurado.')
      } else if (status === 404) {
        toast.error('Ruta no encontrada. Despliega el backend "lashes-backend" en Render y usa esa URL en el frontend.')
      } else if (isWrongCredentials) {
        toast.error(msg || 'Correo o contraseña incorrectos')
      } else {
        toast.error(msg || 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rose-light flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-rose-dark">BETHLASHES</h1>
          <p className="text-gray-500 mt-2">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              {...register('email', { 
                required: 'Correo requerido',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Correo inválido'
                }
              })}
              type="email"
              placeholder="tu@correo.com"
              className={`w-full input-field ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              {...register('password', { 
                required: 'Contraseña requerida',
                minLength: {
                  value: 6,
                  message: 'Mínimo 6 caracteres'
                }
              })}
              type="password"
              placeholder="••••••••"
              className={`w-full input-field ${errors.password ? 'border-red-500' : ''}`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !isValid}
            className="btn-primary w-full mt-2 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-rose-dark font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
