import Icon from '../components/Icon';
export default function AlertasView({
    productosConAlertas,
    registrarMovimiento,
    formatDate
}) {
    const criticos = productosConAlertas.filter(p =>
        (p.nivelAlerta === 'CRITICO' || p.nivelAlerta === 'VENCIDO') && p.cantidad > 0
    );

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            
            {/* 1. HEADER DE ALERTAS */}
            <div className="px-6 py-4 border-b border-gray-200 bg-red-50/30 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Icon name="AlertTriangle" size={20} className="text-red-500" />
                    Alertas de Caducidad
                </h3>
                <span className="text-sm font-medium bg-white border border-red-200 text-red-600 px-3 py-1 rounded-full shadow-sm">
                    {criticos.length} alertas activas
                </span>
            </div>

            {/* 2. CONTENEDOR DE TARJETAS */}
            <div className="overflow-y-auto p-4 sm:p-6 bg-gray-50/50 flex-1">
                {criticos.length === 0 ? (
                    /* ESTADO VACÍO (Todo está bien) */
                    <div className="text-center py-16 flex flex-col items-center bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Icon name="ShieldCheck" size={56} className="text-emerald-400 mb-4" />
                        <p className="text-xl font-medium text-gray-800">Todo el inventario está sano</p>
                        <p className="text-gray-500 mt-2">No hay productos vencidos ni próximos a vencer.</p>
                    </div>
                ) : (
                    /* LISTA DE ALERTAS */
                    <div className="grid grid-cols-1 gap-4">
                        {criticos.map(producto => {
                            const esVencido = producto.nivelAlerta === 'VENCIDO';
                            
                            return (
                                <div 
                                    key={producto.id} 
                                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl border shadow-sm transition-all hover:shadow-md ${
                                        esVencido 
                                            ? 'bg-red-50/80 border-red-200' 
                                            : 'bg-orange-50/80 border-orange-200'
                                    }`}
                                >
                                    {/* Información del Producto */}
                                    <div className="flex items-start gap-4 mb-4 sm:mb-0">
                                        <div className={`p-3 rounded-full mt-1 ${esVencido ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                            <Icon name={esVencido ? 'XOctagon' : 'Clock'} size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-lg">{producto.nombre}</h4>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                                <span className="font-medium bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">{producto.categoria}</span>
                                                <span>•</span>
                                                <span>Stock actual: <strong className="text-gray-800">{producto.cantidad} unidades</strong></span>
                                            </div>
                                            <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${esVencido ? 'text-red-600' : 'text-orange-600'}`}>
                                                <Icon name="CalendarX" size={16} />
                                                {esVencido ? 'Venció el:' : 'Vence el:'} {formatDate(producto.fecha_caducidad)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botón de Acción (Dar de baja) */}
                                    <div className="w-full sm:w-auto">
                                        <button 
                                            onClick={() => {
                                                if(window.confirm(`¿Seguro que deseas dar de baja TODO el stock (${producto.cantidad} unidades) de ${producto.nombre} por concepto de MERMA?`)) {
                                                    registrarMovimiento('MERMA', producto, producto.cantidad, `Baja del sistema por caducidad (Estado: ${producto.nivelAlerta})`);
                                                }
                                            }}
                                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                                                esVencido 
                                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                                            }`}
                                        >
                                            <Icon name="Trash2" size={18} />
                                            Mandar a Merma
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}