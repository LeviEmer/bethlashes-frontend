import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function GestionSlots() {
  const [inicio, setInicio] = useState('')
  const [fin, setFin] = useState('')
  const [horaInicio, setHoraInicio] = useState(8)
  const [horaFin, setHoraFin] = useState(18)
  const [duracion, setDuracion] = useState(60)
  const [inicioGenerar, setInicioGenerar] = useState('')
  const [slots, setSlots] = useState([])
  const [loadingGenerar, setLoadingGenerar] = useState(false)
  const [loadingBuscar, setLoadingBuscar] = useState(false)

  const generarSlots = async () => {
    if (!inicioGenerar) return toast.error('Selecciona una fecha de inicio')
    setLoadingGenerar(true)
    try {
      await api.post(`/slots/generar?inicio=${inicioGenerar}T00:00:00&horaInicio=${horaInicio}&horaFin=${horaFin}&duracion=${duracion}`)
      toast.success('Slots generados correctamente ✅')
    } catch {
      toast.error('Error al generar slots')
    } finally {
      setLoadingGenerar(false)
    }
  }

  const buscarSlots = async () => {
    if (!inicio || !fin) return toast.error('Selecciona rango de fechas')
    setLoadingBuscar(true)
    try {
      const res = await api.get(`/slots?inicio=${inicio}T00:00:00&fin=${fin}T23:59:59`)
      setSlots(res.data)
    } catch {
      toast.error('Error al buscar slots')
    } finally {
      setLoadingBuscar(false)
    }
  }

  const bloquear = async (id) => {
    const motivo = prompt('Motivo del bloqueo:')
    if (!motivo) return
    try {
      await api.put(`/slots/${id}/bloquear?motivo=${motivo}`)
      toast.success('Slot bloqueado')
      buscarSlots()
    } catch {
      toast.error('Error al bloquear slot')
    }
  }

  const desbloquear = async (id) => {
    try {
      await api.put(`/slots/${id}/desbloquear`)
      toast.success('Slot desbloqueado')
      buscarSlots()
    } catch {
      toast.error('Error al desbloquear slot')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Volver */}
      <div className="mb-4">
        <Link to="/dashboard" className="text-sm text-rose-dark hover:underline font-medium">
          ← Volver al Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-rose-dark mb-6">Gestión de Slots</h1>

      {/* Generar slots */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Generar slots por semana</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-600">Semana desde</label>
            <input
              type="date"
              className="input-field mt-1"
              value={inicioGenerar}
              onChange={e => setInicioGenerar(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Hora inicio</label>
            <input
              type="number"
              className="input-field mt-1"
              value={horaInicio}
              min={6} max={22}
              onChange={e => setHoraInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Hora fin</label>
            <input
              type="number"
              className="input-field mt-1"
              value={horaFin}
              min={6} max={22}
              onChange={e => setHoraFin(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Duración (min)</label>
            <input
              type="number"
              className="input-field mt-1"
              value={duracion}
              min={15}
              onChange={e => setDuracion(e.target.value)}
            />
          </div>
        </div>
        <button onClick={generarSlots} disabled={loadingGenerar} className="btn-primary mt-4">
          {loadingGenerar ? 'Generando...' : 'Generar slots'}
        </button>
      </div>

      {/* Ver y gestionar slots */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Ver slots por rango</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600">Desde</label>
            <input
              type="date"
              className="input-field mt-1"
              value={inicio}
              onChange={e => setInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Hasta</label>
            <input
              type="date"
              className="input-field mt-1"
              value={fin}
              onChange={e => setFin(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button onClick={buscarSlots} disabled={loadingBuscar} className="btn-primary">
              {loadingBuscar ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {slots.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay slots para mostrar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Fecha y hora</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Motivo bloqueo</th>
                  <th className="pb-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{new Date(slot.fechaHora).toLocaleString('es-SV')}</td>
                    <td className="py-2">
                      {slot.bloqueado ? (
                        <span className="text-red-500 font-medium">Bloqueado</span>
                      ) : slot.disponible ? (
                        <span className="text-green-500 font-medium">Disponible</span>
                      ) : (
                        <span className="text-yellow-500 font-medium">Ocupado</span>
                      )}
                    </td>
                    <td className="py-2 text-gray-400">{slot.motivoBLoqueo || '—'}</td>
                    <td className="py-2">
                      {slot.bloqueado ? (
                        <button onClick={() => desbloquear(slot.id)} className="text-green-600 hover:underline text-xs">
                          Desbloquear
                        </button>
                      ) : (
                        <button onClick={() => bloquear(slot.id)} className="text-red-500 hover:underline text-xs">
                          Bloquear
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
    </div>
  )
}
