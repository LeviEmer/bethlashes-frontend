import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
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

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-SV', {
      weekday: 'short', month: 'short',
      day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

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

  return (
    <div className="min-h-screen bg-rose-light">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-8">
        <h2 className="font-display text-3xl font-bold text-rose-dark mb-6">Agendar Cita</h2>

        <form onSubmit={onSubmit} className="card space-y-6">
          {/* Servicios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Elige tu servicio
            </label>
            <div className="grid grid-cols-1 gap-3">
              {servicios.map(s => (
                <div
                  key={s.id}
                  onClick={() => setServicioId(String(s.id))}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    servicioId === String(s.id)
                      ? 'border-rose-main bg-rose-light'
                      : 'border-gray-200 hover:border-rose-main'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{s.nombre}</p>
                      <p className="text-sm text-gray-500">{s.descripcion}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-dark">${s.precio}</p>
                      <p className="text-xs text-gray-400">{s.duracionMinutos} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Elige tu horario
            </label>
            <select
              value={slotId}
              onChange={e => setSlotId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Selecciona un horario --</option>
              {slots.map(s => (
                <option key={s.id} value={s.id}>
                  {formatFecha(s.fechaHora)}
                </option>
              ))}
            </select>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota adicional (opcional)
            </label>
            <textarea
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Ej: Tengo pestañas postizas puestas, alergia a algún producto..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {servicioSeleccionado && slotId && (
            <div className="bg-rose-light border border-rose-soft rounded-xl p-4">
              <p className="text-sm font-semibold text-rose-dark">Resumen de tu cita</p>
              <p className="text-sm text-gray-600 mt-1">💆 {servicioSeleccionado.nombre}</p>
              <p className="text-sm text-gray-600">
                📅 {formatFecha(slots.find(s => s.id === Number(slotId))?.fechaHora)}
              </p>
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
