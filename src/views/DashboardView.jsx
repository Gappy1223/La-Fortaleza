export default function DashboardView({
    estadisticas,
    productos,
    productosConAlertas,
    formatCurrency,
    formatDate,
    setCurrentView,
    registrarMovimiento
}) {
    return (
        <div className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div>Total Productos</div>
                    <div>{estadisticas.totalProductos}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div>Valor</div>
                    <div>{formatCurrency(estadisticas.valorTotal)}</div>
                </div>
            </div>

            {/* Stock bajo */}
            {productos
                .filter(p => p.cantidad <= p.nivel_minimo)
                .map(producto => (
                    <button
                        key={producto.id}
                        onClick={() => {
                            const cantidad = prompt("Cantidad:");
                            if (cantidad) {
                                registrarMovimiento('ENTRADA', producto, parseInt(cantidad));
                            }
                        }}
                    >
                        Reabastecer {producto.nombre}
                    </button>
                ))}
        </div>
    );
}