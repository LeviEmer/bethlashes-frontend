import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'

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

export default function Dashboard() {
  const [citasHoy, setCitasHoy] = useState([])
  const [todasCitas, setTodasCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalReprogramar, setModalReprogramar] = useState(null)
  const [slots, setSlots] = useState([])
  const [nuevoSlotId, setNuevoSlotId] = useState('')
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [hoy, todas] = await Promise.all([
        api.get('/appointments/hoy'),
        api.get('/appointments')
      ])
      setCitasHoy(hoy.data)
      setTodasCitas(todas.data)
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const confirmar = async (id) => {
    try {
      await api.put(`/appointments/${id}/confirmar`)
      toast.success('Cita confirmada ✅')
      cargarDatos()
    } catch {
      toast.error('Error al confirmar')
    }
  }

  const cancelar = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return
    try {
      await api.put(`/appointments/${id}/cancelar`)
      toast.success('Cita cancelada')
      cargarDatos()
    } catch {
      toast.error('Error al cancelar')
    }
  }

  const abrirReprogramar = async (cita) => {
    setModalReprogramar(cita)
    setNuevoSlotId('')
    setMotivo('')
    const res = await api.get('/slots/disponibles')
    setSlots(res.data)
  }

  const reprogramar = async () => {
    if (!nuevoSlotId) { toast.error('Selecciona un horario'); return }
    try {
      await api.put(`/appointments/${modalReprogramar.id}/reprogramar`, null, {
        params: { nuevoSlotId, motivo }
      })
      toast.success('Cita reprogramada 📅')
      setModalReprogramar(null)
      cargarDatos()
    } catch {
      toast.error('Error al reprogramar')
    }
  }

  const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-SV', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const pendientes = todasCitas.filter(c => c.estado === 'PENDIENTE').length
  const confirmadas = todasCitas.filter(c => c.estado === 'CONFIRMADA').length
  const canceladas = todasCitas.filter(c => c.estado === 'CANCELADA').length

  return (
    <div className="min-h-screen bg-rose-light">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* KPIs */}
        <h2 className="font-display text-3xl font-bold text-rose-dark mb-6">Panel de Control</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Citas hoy', value: citasHoy.length, icon: '📅' },
            { label: 'Pendientes', value: pendientes, icon: '⏳' },
            { label: 'Confirmadas', value: confirmadas, icon: '✅' },
            { label: 'Canceladas', value: canceladas, icon: '❌' },
          ].map((k, i) => (
            <div key={i} className="card text-center">
              <p className="text-3xl">{k.icon}</p>
              <p className="text-3xl font-bold text-rose-dark mt-1">{k.value}</p>
              <p className="text-sm text-gray-500">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Citas de hoy */}
        <div className="mb-8">
          <h3 className="font-display text-xl font-bold text-gray-800 mb-4">Citas de Hoy</h3>
          {loading ? (
            <p className="text-gray-400">Cargando...</p>
          ) : citasHoy.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-4xl mb-2">🌸</p>
              <p className="text-gray-400">No hay citas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citasHoy.map(cita => (
                <CitaCard
                  key={cita.id}
                  cita={cita}
                  formatFecha={formatFecha}
                  onConfirmar={confirmar}
                  onCancelar={cancelar}
                  onReprogramar={abrirReprogramar}
                />
              ))}
            </div>
          )}
        </div>

        {/* Todas las citas */}
        <div>
          <h3 className="font-display text-xl font-bold text-gray-800 mb-4">Todas las Citas</h3>
          <div className="space-y-3">
            {todasCitas.map(cita => (
              <CitaCard
                key={cita.id}
                cita={cita}
                formatFecha={formatFecha}
                onConfirmar={confirmar}
                onCancelar={cancelar}
                onReprogramar={abrirReprogramar}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal Reprogramar */}
      {modalReprogramar && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="card w-full max-w-md">
            <h3 className="font-display text-xl font-bold text-rose-dark mb-4">
              Reprogramar Cita
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Cliente: <strong>{modalReprogramar.clienteNombre}</strong><br />
              Servicio: <strong>{modalReprogramar.servicioNombre}</strong><br />
              Fecha actual: <strong>{formatFecha(modalReprogramar.fechaHora)}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva fecha y hora
                </label>
                <select
                  value={nuevoSlotId}
                  onChange={e => setNuevoSlotId(e.target.value)}
                  className="input-field"
                >
                  <option value="">-- Selecciona nuevo horario --</option>
                  {slots.map(s => (
                    <option key={s.id} value={s.id}>
                      {formatFecha(s.fechaHora)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo (opcional)
                </label>
                <input
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Ej: Emergencia, reagendamiento de agenda..."
                  className="input-field"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={reprogramar} className="btn-primary flex-1">
                  Confirmar cambio
                </button>
                <button
                  onClick={() => setModalReprogramar(null)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CitaCard({ cita, formatFecha, onConfirmar, onCancelar, onReprogramar }) {
  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-800">{cita.clienteNombre}</p>
            <BadgeEstado estado={cita.estado} />
          </div>
          <p className="text-sm text-gray-500">💆 {cita.servicioNombre}</p>
          <p className="text-sm text-gray-500">📅 {formatFecha(cita.fechaHora)}</p>
          <p className="text-sm text-gray-500">
            💵 ${cita.servicioPrice} · ⏱ {cita.duracionMinutos} min
          </p>
          {cita.notaCliente && (
            <p className="text-sm text-gray-400 mt-1">📝 {cita.notaCliente}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {cita.estado === 'PENDIENTE' && (
            <button
              onClick={() => onConfirmar(cita.id)}
              className="text-xs bg-green-100 text-green-700 hover:bg-green-200 font-semibold px-3 py-1 rounded-full transition"
            >
              ✅ Confirmar
            </button>
          )}
          {(cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA') && (
            <>
              <button
                onClick={() => onReprogramar(cita)}
                className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold px-3 py-1 rounded-full transition"
              >
                📅 Reprogramar
              </button>
              <button
                onClick={() => onCancelar(cita.id)}
                className="text-xs bg-red-100 text-red-700 hover:bg-red-200 font-semibold px-3 py-1 rounded-full transition"
              >
                ❌ Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
