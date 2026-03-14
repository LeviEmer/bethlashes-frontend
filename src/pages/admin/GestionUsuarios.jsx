import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const ROLES = ['CLIENT', 'ADMIN_OPERATOR', 'ADMIN_DEV']

const BadgeRol = ({ rol }) => {
  const clases = {
    CLIENT: 'bg-gray-100 text-gray-600',
    ADMIN_OPERATOR: 'bg-blue-100 text-blue-700',
    ADMIN_DEV: 'bg-rose-100 text-rose-700'
  }
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${clases[rol]}`}>
      {rol}
    </span>
  )
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroRol, setFiltroRol] = useState('')

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios')
      setUsuarios(res.data)
    } catch {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const cambiarRol = async (id, nuevoRol) => {
    try {
      await api.put(`/usuarios/${id}/rol?nuevoRol=${nuevoRol}`)
      toast.success('Rol actualizado')
      cargarUsuarios()
    } catch {
      toast.error('No se pudo cambiar el rol')
    }
  }

  const toggleActivo = async (id, activo) => {
    if (!confirm(`¿${activo ? 'Desactivar' : 'Activar'} este usuario?`)) return
    try {
      await api.put(`/usuarios/${id}/toggle-activo`)
      toast.success(activo ? 'Usuario desactivado' : 'Usuario activado')
      cargarUsuarios()
    } catch {
      toast.error('No se pudo actualizar el usuario')
    }
  }

  const usuariosFiltrados = filtroRol
    ? usuarios.filter(u => u.rol === filtroRol)
    : usuarios

  return (
    <div className="min-h-screen bg-rose-light">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-rose-dark">Usuarios</h2>
            <p className="text-gray-500 text-sm mt-1">{usuarios.length} usuarios registrados</p>
          </div>
          {/* Filtro */}
          <select
            value={filtroRol}
            onChange={e => setFiltroRol(e.target.value)}
            className="input-field w-auto text-sm"
          >
            <option value="">Todos los roles</option>
            {ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12">Cargando...</p>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400">No hay usuarios con ese filtro</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 font-medium">Usuario</th>
                  <th className="pb-3 font-medium">Teléfono</th>
                  <th className="pb-3 font-medium">Rol</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuariosFiltrados.map(u => (
                  <tr key={u.id} className={`${!u.activo ? 'opacity-50' : ''}`}>
                    <td className="py-3">
                      <p className="font-medium text-gray-800">{u.nombre}</p>
                      <p className="text-gray-400 text-xs">{u.email}</p>
                    </td>
                    <td className="py-3 text-gray-500">
                      {u.telefono || '—'}
                    </td>
                    <td className="py-3">
                      <select
                        value={u.rol}
                        onChange={e => cambiarRol(u.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        u.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-500'
                      }`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleActivo(u.id, u.activo)}
                        className={`text-xs font-medium transition ${
                          u.activo
                            ? 'text-red-400 hover:text-red-600'
                            : 'text-green-500 hover:text-green-700'
                        }`}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
