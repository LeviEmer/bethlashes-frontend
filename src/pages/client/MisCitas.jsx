import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    PENDIENTE: '⏳',
    CONFIRMADA: '✅',
    CANCELADA: '❌',
    REPROGRAMADA: '📅'
  }
  return (
    <span className={clases[estado]}>
      {iconos[estado]} {estado}
    </span>
  )
}

export default function MisCitas() {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarCitas()
  }, [])

  const cargarCitas = async () => {
    try {
      const res = await api.get('/appointments/mis-citas')
      setCitas(res.data)
    } catch {
      toast.error('Error al cargar tus citas')
    } finally {
      setLoading(false)
    }
  }

  const cancelar = async (id) => {
    if (!confirm('¿Segura que deseas cancelar esta cita?')) return
    try {
      await api.put(`/appointments/${id}/cancelar`)
      toast.success('Cita cancelada')
      cargarCitas()
    } catch {
      toast.error('No se pudo cancelar')
    }
  }

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-SV', {
      weekday: 'long', year: 'numeric',
      month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-rose-light">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl font-bold text-rose-dark">Mis Citas</h2>
          <Link to="/agendar" className="btn-primary text-sm">
            + Nueva cita
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12">Cargando...</p>
        ) : citas.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-5xl mb-4">🌸</p>
            <p className="text-gray-500 mb-4">Aún no tienes citas agendadas</p>
            <Link to="/agendar" className="btn-primary">Agendar mi primera cita</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {citas.map(cita => (
              <div key={cita.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{cita.servicioNombre}</h3>
                    <p className="text-gray-500 text-sm mt-1">📅 {formatFecha(cita.fechaHora)}</p>
                    <p className="text-gray-500 text-sm">⏱ {cita.duracionMinutos} min · 💵 ${cita.servicioPrice}</p>
                    {cita.notaCliente && (
                      <p className="text-gray-400 text-sm mt-1">📝 {cita.notaCliente}</p>
                    )}
                  </div>
                  <BadgeEstado estado={cita.estado} />
                </div>
                {(cita.estado === 'PENDIENTE' || cita.estado === 'CONFIRMADA') && (
                  <button
                    onClick={() => cancelar(cita.id)}
                    className="mt-4 text-sm text-red-400 hover:text-red-600 transition"
                  >
                    Cancelar cita
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
