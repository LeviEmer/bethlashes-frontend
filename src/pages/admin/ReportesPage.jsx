import { useEffect, useState } from 'react'
import api from '../../utils/api'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from 'recharts'

const COLORS = ['#a78bfa', '#f472b6', '#34d399', '#fb923c', '#60a5fa']

export default function ReportesPage() {
  const [resumen, setResumen] = useState(null)
  const [porEstado, setPorEstado] = useState([])
  const [porServicio, setPorServicio] = useState([])
  const [porDia, setPorDia] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hoy = new Date()
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 19)
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59).toISOString().slice(0, 19)

    Promise.all([
      api.get('/reportes/resumen'),
      api.get('/reportes/por-estado'),
      api.get('/reportes/por-servicio'),
      api.get(`/reportes/por-dia?inicio=${inicio}&fin=${fin}`)
    ]).then(([r1, r2, r3, r4]) => {
      setResumen(r1.data)
      setPorEstado(r2.data.map(d => ({ name: d.estado, value: Number(d.total) })))
      setPorServicio(r3.data.map(d => ({ name: d.servicio, citas: Number(d.total), ingresos: Number(d.ingresoTotal) })))
      setPorDia(r4.data.map(d => ({ fecha: d.fecha, citas: Number(d.total) })))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="p-6 text-gray-500">Cargando reportes...</p>

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>

      {/* Tarjetas resumen */}
      {resumen && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total citas', value: resumen.totalCitas },
            { label: 'Pendientes', value: resumen.citasPendientes },
            { label: 'Confirmadas', value: resumen.citasConfirmadas },
            { label: 'Canceladas', value: resumen.citasCanceladas },
            { label: 'Reprogramadas', value: resumen.citasReprogramadas },
            { label: 'Ingreso estimado', value: `$${resumen.ingresoEstimadoTotal?.toFixed(2)}` }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-purple-600">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pie chart - Por estado */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Citas por Estado</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={porEstado} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {porEstado.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart - Por servicio */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Citas e Ingresos por Servicio</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={porServicio}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="citas" fill="#a78bfa" name="Citas" />
            <Bar yAxisId="right" dataKey="ingresos" fill="#f472b6" name="Ingresos ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line chart - Por día */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Citas por Día (mes actual)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={porDia}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="citas" stroke="#a78bfa" strokeWidth={2} dot={true} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
