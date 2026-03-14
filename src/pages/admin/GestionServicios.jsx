import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const EMPTY_FORM = { nombre: '', descripcion: '', duracionMinutos: '', precio: '' }

export default function GestionServicios() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    cargarServicios()
  }, [])

  const cargarServicios = async () => {
    try {
      const res = await api.get('/servicios')
      setServicios(res.data)
    } catch {
      toast.error('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }

  const abrirCrear = () => {
    setEditando(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const abrirEditar = (s) => {
    setEditando(s)
    setForm({
      nombre: s.nombre,
      descripcion: s.descripcion,
      duracionMinutos: s.duracionMinutos,
      precio: s.precio
    })
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setEditando(null)
    setForm(EMPTY_FORM)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.duracionMinutos || !form.precio) {
      toast.error('Nombre, duración y precio son requeridos')
      return
    }
    setSaving(true)
    try {
      if (editando) {
        await api.put(`/servicios/${editando.id}`, form)
        toast.success('Servicio actualizado ✅')
      } else {
        await api.post('/servicios', form)
        toast.success('Servicio creado ✅')
      }
      cerrarModal()
      cargarServicios()
    } catch {
      toast.error('No se pudo guardar el servicio')
    } finally {
      setSaving(false)
    }
  }

  const desactivar = async (id) => {
    if (!confirm('¿Desactivar este servicio?')) return
    try {
      await api.delete(`/servicios/${id}`)
      toast.success('Servicio desactivado')
      cargarServicios()
    } catch {
      toast.error('No se pudo desactivar')
    }
  }

  return (
    <div className="min-h-screen bg-rose-light">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-rose-dark">Servicios</h2>
            <p className="text-gray-500 text-sm mt-1">{servicios.length} servicios registrados</p>
          </div>
          <button onClick={abrirCrear} className="btn-primary text-sm">
            + Nuevo servicio
          </button>
        </div>

        {/* Tabla */}
        {loading ? (
          <p className="text-center text-gray-400 py-12">Cargando...</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 font-medium">Servicio</th>
                  <th className="pb-3 font-medium">Duración</th>
                  <th className="pb-3 font-medium">Precio</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {servicios.map(s => (
                  <tr key={s.id} className={!s.activo ? 'opacity-50' : ''}>
                    <td className="py-3">
                      <p className="font-medium text-gray-800">{s.nombre}</p>
                      <p className="text-gray-400 text-xs">{s.descripcion}</p>
                    </td>
                    <td className="py-3 text-gray-500">⏱ {s.duracionMinutos} min</td>
                    <td className="py-3 font-semibold text-rose-dark">${s.precio}</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        s.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-500'
                      }`}>
                        {s.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 flex gap-3">
                      <button
                        onClick={() => abrirEditar(s)}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium transition"
                      >
                        Editar
                      </button>
                      {s.activo && (
                        <button
                          onClick={() => desactivar(s.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium transition"
                        >
                          Desactivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="card w-full max-w-md">
            <h3 className="font-display text-xl font-bold text-rose-dark mb-4">
              {editando ? 'Editar servicio' : 'Nuevo servicio'}
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Extensiones clásicas"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción del servicio..."
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                  <input
                    type="number"
                    value={form.duracionMinutos}
                    onChange={e => setForm({ ...form, duracionMinutos: e.target.value })}
                    placeholder="90"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                  <input
                    type="number"
                    value={form.precio}
                    onChange={e => setForm({ ...form, precio: e.target.value })}
                    placeholder="25"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary">
                  {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
