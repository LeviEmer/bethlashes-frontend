import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function Agendar() {
  const [servicios, setServicios] = useState([])
  const [slots, setSlots] = useState([])
  const [servicioId, setServicioId] = useState('')
  const [slotId, setSlotId] = useState('')
  const [nota, setNota] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/servicios/publico').then(r => setServicios(r.data))
    api.get('/slots/disponibles').then(r => setSlots(r.data))
  }, [])

  const formatFecha = (fecha) => new Date(fecha).toLocaleString('es-SV', {
    weekday: 'short', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!servicioId || !slotId) {
      toast.error('Selecciona un servicio y un horario')
      return
    }
    setLoading(true)
    try {
      await api.post('/appointments', {
        servicioId: Number(servicioId),
        slotId: Number(slotId),
        notaCliente: nota
      })
      toast.success('¡Cita agendada! 🌸 Te confirmaremos pronto')
      navigate('/mis-citas')
    } catch {
      toast.error('No se pudo agendar la cita')
    } finally {
      setLoading(false)
    }
  }

  const servicioSeleccionado = servicios.find(s => s.id === Number(servicioId))
  const slotSeleccionado = slots.find(s => s.id === Number(slotId))

  // Agrupar slots por fecha
  const slotsPorFecha = slots.reduce((acc, slot) => {
    const fecha = new Date(slot.fechaHora).toLocaleDateString('es-SV', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
    if (!acc[fecha]) acc[fecha] = []
    acc[fecha].push(slot)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-rose-light">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="font-display text-3xl font-bold text-rose-dark mb-2">Agendar Cita</h2>
        <p className="text-gray-500 text-sm mb-6">Selecciona tu servicio y horario preferido 🌸</p>

        <form onSubmit={onSubmit} className="space-y-6">

          {/* Paso 1 — Servicios */}
          <div className="card">
            <p className="text-xs font-bold text-rose-dark uppercase tracking-wider mb-3">
              Paso 1 — Elige tu servicio
            </p>
            <div className="grid grid-cols-1 gap-3">
              {servicios.map(s => (
                <div
                  key={s.id}
                  onClick={() => setServicioId(String(s.id))}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    servicioId === String(s.id)
                      ? 'border-rose-main bg-rose-light shadow-sm'
                      : 'border-gray-200 hover:border-rose-main bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{s.nombre}</p>
                      <p className="text-sm text-gray-500">{s.descripcion}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-bold text-rose-dark">${s.precio}</p>
                      <p className="text-xs text-gray-400">⏱ {s.duracionMinutos} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paso 2 — Slots */}
          <div className="card">
            <p className="text-xs font-bold text-rose-dark uppercase tracking-wider mb-3">
              Paso 2 — Elige tu horario
            </p>
            {slots.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No hay horarios disponibles</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(slotsPorFecha).map(([fecha, slotsDelDia]) => (
                  <div key={fecha}>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2 capitalize">{fecha}</p>
                    <div className="flex flex-wrap gap-2">
                      {slotsDelDia.map(s => (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => setSlotId(String(s.id))}
                          className={`text-sm px-3 py-2 rounded-xl border-2 font-medium transition-all ${
                            slotId === String(s.id)
                              ? 'border-rose-main bg-rose-main text-white'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-rose-main'
                          }`}
                        >
                          {new Date(s.fechaHora).toLocaleTimeString('es-SV', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paso 3 — Nota */}
          <div className="card">
            <p className="text-xs font-bold text-rose-dark uppercase tracking-wider mb-3">
              Paso 3 — Nota adicional (opcional)
            </p>
            <textarea
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Ej: Tengo pestañas postizas, alergia a algún producto..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Resumen */}
          {servicioSeleccionado && slotSeleccionado && (
            <div className="bg-white border-2 border-rose-main rounded-xl p-4">
              <p className="text-sm font-bold text-rose-dark mb-2">✨ Resumen de tu cita</p>
              <p className="text-sm text-gray-600">💆 {servicioSeleccionado.nombre}</p>
              <p className="text-sm text-gray-600">📅 {formatFecha(slotSeleccionado.fechaHora)}</p>
              <p className="text-sm text-gray-600">
                💵 ${servicioSeleccionado.precio} · ⏱ {servicioSeleccionado.duracionMinutos} min
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Agendando...' : 'Confirmar cita 🌸'}
          </button>
        </form>
      </div>
    </div>
  )
}
