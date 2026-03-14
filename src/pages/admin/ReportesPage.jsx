import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const ESTADOS = ['TODOS', 'CONFIRMADA', 'CANCELADA', 'PENDIENTE']

const BadgeEstado = ({ estado }) => {
  const clases = {
    PENDIENTE: 'badge-pendiente',
    CONFIRMADA: 'badge-confirmada',
    CANCELADA: 'badge-cancelada',
    REPROGRAMADA: 'badge-reprogramada'
  }
  const iconos = {
    PENDIENTE: '⏳', CONFIRMADA: '✅',
    CANCELADA: '❌', REPROGRAMADA: '📅'
  }
  return <span className={clases[estado]}>{iconos[estado]} {estado}</span>
}

export default function ReportesPage() {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  useEffect(() => {
    cargarCitas()
  }, [])

  const cargarCitas = async () => {
    try {
      const res = await api.get('/appointments')
      setCitas(res.data)
    } catch {
      toast.error('Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }

  const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-SV', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const citasFiltradas = citas.filter(c => {
    const fechaCita = new Date(c.fechaHora)
    if (fechaDesde && fechaCita < new Date(fechaDesde + 'T00:00:00')) return false
    if (fechaHasta && fechaCita > new Date(fechaHasta + 'T23:59:59')) return false
    if (filtroEstado !== 'TODOS' && c.estado !== filtroEstado) return false
    return true
  })

  return (
    <div className="min-h-screen bg-rose-light">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        <h2 className="font-display text-3xl font-bold text-rose-dark mb-6">Reportes de Citas</h2>

        {/* Filtros */}
        <div className="card mb-6">
          <h3 className="font-display text-lg font-bold text-gray-800 mb-4">Filtros</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={e => setFechaDesde(e.target.value)}
                className="input-field w-auto min-w-[160px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={e => setFechaHasta(e.target.value)}
                className="input-field w-auto min-w-[160px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                className="input-field w-auto min-w-[140px]"
              >
                {ESTADOS.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="card overflow-x-auto">
          {loading ? (
            <p className="text-center text-gray-400 py-12">Cargando...</p>
          ) : citasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">📋</p>
              <p className="text-gray-400">No hay citas con los filtros seleccionados</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{citasFiltradas.length} citas</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-500">
                    <th className="pb-3 font-medium">Cliente</th>
                    <th className="pb-3 font-medium">Servicio</th>
                    <th className="pb-3 font-medium">Fecha y hora</th>
                    <th className="pb-3 font-medium">Duración</th>
                    <th className="pb-3 font-medium">Precio</th>
                    <th className="pb-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {citasFiltradas.map(cita => (
                    <tr key={cita.id} className="hover:bg-gray-50/50">
                      <td className="py-3">
                        <p className="font-medium text-gray-800">{cita.clienteNombre}</p>
                        {cita.notaCliente && (
                          <p className="text-gray-400 text-xs mt-0.5 truncate max-w-[180px]" title={cita.notaCliente}>
                            📝 {cita.notaCliente}
                          </p>
                        )}
                      </td>
                      <td className="py-3 text-gray-600">{cita.servicioNombre}</td>
                      <td className="py-3 text-gray-600">{formatFecha(cita.fechaHora)}</td>
                      <td className="py-3 text-gray-600">{cita.duracionMinutos} min</td>
                      <td className="py-3 text-gray-600">${cita.servicioPrice}</td>
                      <td className="py-3">
                        <BadgeEstado estado={cita.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
