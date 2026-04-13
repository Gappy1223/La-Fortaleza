import Icon from '../components/Icon';
export default function DashboardView({
    estadisticas,
    productos,
    productosConAlertas,
    formatCurrency,
    formatDate,
    setCurrentView,
    registrarMovimiento
}) {
    const productosBajoStock = productos.filter(p=> p.cantidad <= p.nivel_minimo);
    return (
        <div className="space-y-6">
            
            {/* 1. TARJETAS DE INDICADORES (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Total de Productos */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Productos</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{estadisticas.totalProductos}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Icon name="Package" size={20} />
                        </div>
                    </div>
                </div>

                {/* Valor Total del Inventario */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Valor Inventario</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(estadisticas.valorTotal)}</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Icon name="CircleDollarSign" size={20} />
                        </div>
                    </div>
                </div>

                {/* Productos Vencidos */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Vencidos</p>
                            <h3 className="text-2xl font-bold text-red-600 mt-1">{estadisticas.vencidos}</h3>
                        </div>
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <Icon name="XOctagon" size={20} />
                        </div>
                    </div>
                </div>

                {/* Alertas Críticas */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Críticos (≤ 3 días)</p>
                            <h3 className="text-2xl font-bold text-orange-600 mt-1">{estadisticas.criticos}</h3>
                        </div>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Icon name="AlertTriangle" size={20} />
                        </div>
                    </div>
                </div>

                {/* Alertas de Atención */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Atención (≤ 7 días)</p>
                            <h3 className="text-2xl font-bold text-yellow-600 mt-1">{estadisticas.atencion}</h3>
                        </div>
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                            <Icon name="Bell" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. SECCIÓN PRINCIPAL: ALERTAS DE STOCK Y ACCESOS RÁPIDOS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Panel Izquierdo: Lista de Stock Bajo (Ocupa 2/3 del espacio) */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Icon name="TrendingDown" size={18} className="text-red-500"/>
                            Productos con Stock Bajo
                        </h3>
                        <span className="text-sm text-gray-500 font-medium bg-white border px-2 py-1 rounded-md">
                            {productosBajoStock.length} por revisar
                        </span>
                    </div>
                    
                    <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                        {productosBajoStock.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <Icon name="CheckCircle2" size={40} className="text-emerald-400 mb-3" />
                                <p>Todo el inventario está en niveles óptimos.</p>
                            </div>
                        ) : (
                            productosBajoStock.map(producto => (
                                <div key={producto.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                            <Icon name="Archive" size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{producto.nombre}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Categoría: <span className="font-medium">{producto.categoria}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-bold text-red-600">{producto.cantidad} unidades</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Mínimo ideal: {producto.nivel_minimo}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const cantidad = prompt(`¿Cuántas unidades de ${producto.nombre} vas a ingresar?`);
                                                // Validamos que sea un número válido antes de procesarlo
                                                if (cantidad && !isNaN(cantidad) && parseInt(cantidad) > 0) {
                                                    registrarMovimiento('ENTRADA', producto, parseInt(cantidad), 'Reabastecimiento rápido desde el Dashboard');
                                                }
                                            }}
                                            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-sm font-semibold transition-colors border border-emerald-200"
                                        >
                                            Reabastecer
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Panel Derecho: Accesos Rápidos */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-800">Accesos Rápidos</h3>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        <button 
                            onClick={() => setCurrentView('inventario')}
                            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 group transition-all text-left"
                        >
                            <div className="p-2 bg-gray-100 group-hover:bg-white group-hover:text-emerald-600 rounded-md transition-colors"><Icon name="Search" size={18} /></div>
                            <div>
                                <p className="font-medium text-gray-800 group-hover:text-emerald-700">Buscar Producto</p>
                                <p className="text-xs text-gray-500">Ir al catálogo completo</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => setCurrentView('alertas')}
                            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-red-500 hover:bg-red-50 group transition-all text-left"
                        >
                            <div className="p-2 bg-gray-100 group-hover:bg-white group-hover:text-red-600 rounded-md transition-colors"><Icon name="AlertCircle" size={18} /></div>
                            <div>
                                <p className="font-medium text-gray-800 group-hover:text-red-700">Revisar Caducidades</p>
                                <p className="text-xs text-gray-500">Ver próximos a vencer</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => setCurrentView('movimientos')}
                            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 group transition-all text-left"
                        >
                            <div className="p-2 bg-gray-100 group-hover:bg-white group-hover:text-blue-600 rounded-md transition-colors"><Icon name="History" size={18} /></div>
                            <div>
                                <p className="font-medium text-gray-800 group-hover:text-blue-700">Historial de Operaciones</p>
                                <p className="text-xs text-gray-500">Ver entradas y salidas</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}