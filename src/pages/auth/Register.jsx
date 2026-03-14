import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        password: data.password
      })
      login(res.data)
      toast.success('¡Cuenta creada! Bienvenida 🌸')
      navigate('/mis-citas')
    } catch {
      toast.error('El correo ya está registrado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rose-light flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-8">
          <p className="text-3xl mb-2">🌸</p>
          <h1 className="font-display text-4xl font-bold text-rose-dark">BETHLASHES</h1>
          <p className="text-gray-400 text-sm mt-1">Studio de pestañas profesional</p>
          <p className="text-gray-500 mt-3 font-medium">Crea tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              {...register('nombre', {
                required: 'El nombre es requerido',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
              })}
              type="text"
              placeholder="Tu nombre completo"
              className={`input-field ${errors.nombre ? 'border-red-400' : ''}`}
            />
            {errors.nombre && (
              <p className="text-red-400 text-xs mt-1">{errors.nombre.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              {...register('email', {
                required: 'El correo es requerido',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Correo no válido'
                }
              })}
              type="email"
              placeholder="tu@correo.com"
              className={`input-field ${errors.email ? 'border-red-400' : ''}`}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              {...register('telefono', {
                pattern: {
                  value: /^[0-9]{8}$/,
                  message: 'Ingresa 8 dígitos sin espacios'
                }
              })}
              type="text"
              placeholder="12345678"
              maxLength={8}
              className={`input-field ${errors.telefono ? 'border-red-400' : ''}`}
            />
            {errors.telefono && (
              <p className="text-red-400 text-xs mt-1">{errors.telefono.message}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                })}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: val => val === password || 'Las contraseñas no coinciden'
                })}
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta 🌸'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-rose-dark font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
