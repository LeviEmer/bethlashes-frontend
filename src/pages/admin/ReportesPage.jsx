export default function ReportesPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-rose-dark mb-8">📊 Reportes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Citas Totales</h3>
          <p className="text-3xl font-bold text-rose-main">124</p>
        </div>
        <div className="card p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">12</p>
        </div>
        <div className="card p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Confirmadas</h3>
          <p className="text-3xl font-bold text-green-600">89</p>
        </div>
      </div>
      <div className="card mt-8 p-6">
        <p>Gráficos avanzados próximamente ✨</p>
      </div>
    </div>
  )
}
