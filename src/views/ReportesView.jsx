import { useMemo } from 'react';
import Icon from '../components/Icon.jsx';

export default function ReportesView({
    movimientos,
    estadisticas,
    cortesCaja,
    formatCurrency
}) {
    // 1. Cálculos Financieros
    const ventasTotales = movimientos
        .filter(m => m.tipo === 'SALIDA')
        .reduce((sum, v) => sum + (v.valor_total || 0), 0);

    const mermasTotales = movimientos
        .filter(m => m.tipo === 'MERMA')
        .reduce((sum, v) => sum + (v.valor_total || 0), 0);

    const comprasTotales = movimientos
        .filter(m => m.tipo === 'ENTRADA')
        .reduce((sum, v) => sum + (v.valor_total || 0), 0);

    const itemsVendidos = movimientos
        .filter(m => m.tipo === 'SALIDA')
        .reduce((sum, v) => sum + (v.cantidad || 0), 0);

    const ventasMensuales = useMemo(()=>{
        if(!cortesCaja || cortesCaja.length === 0) return [];
        const grupos = cortesCaja.reduce((acc, corte)=>{
            const fecha = new Date(corte.fecha);
            const mesAño = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            if(!acc[mesAño]){
                acc[mesAño]={
                    mesNombre: fecha.toLocaleString('es-MX', { month: 'long', year: 'numeric' }),
                    ventasTotales: 0,
                    montoCierre: 0,
                    diferencia: 0,
                    diasOperados: 0
                };
            }
            acc[mesAño].ventasTotales += Number(corte.ventas_totales) || 0;
            acc[mesAño].montoCierre += Number(corte.monto_cierre) || 0;
            acc[mesAño].diferencia += Number(corte.diferencia) || 0;
            acc[mesAño].diasOperados += 1;
            return acc;
         }, {});

         return Object.entries(grupos).sort((a, b)=> b[0].localeCompare(a[0])).map(([clave, datos])=>({ clave, ...datos}));
        }, [cortesCaja]);
    


    // 2. Cálculos para barras de progreso (Métricas visuales)
    const totalOperaciones = ventasTotales + mermasTotales + comprasTotales;
    const porcentajeVentas = totalOperaciones === 0 ? 0 : Math.round((ventasTotales / totalOperaciones) * 100);
    const porcentajeMermas = totalOperaciones === 0 ? 0 : Math.round((mermasTotales / totalOperaciones) * 100);
    const porcentajeCompras = totalOperaciones === 0 ? 0 : Math.round((comprasTotales / totalOperaciones) * 100);

    return (
        <div className="space-y-6">
            
            {/* ENCABEZADO */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Icon name="BarChart3" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Reportes Financieros</h2>
                        <p className="text-sm text-gray-500">Resumen de operaciones y estado del capital</p>
                    </div>
                </div>
            </div>

            {/* TARJETAS DE MÉTRICAS PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Ingresos por Ventas */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md"><Icon name="TrendingUp" size={18} /></div>
                        <h3 className="text-sm font-semibold text-gray-600">Ingresos Totales</h3>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(ventasTotales)}</p>
                    <p className="text-xs text-gray-500 mt-1">{itemsVendidos} artículos vendidos</p>
                </div>

                {/* Valor del Inventario */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-md"><Icon name="Boxes" size={18} /></div>
                        <h3 className="text-sm font-semibold text-gray-600">Capital en Inventario</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{formatCurrency(estadisticas.valorTotal)}</p>
                    <p className="text-xs text-gray-500 mt-1">{estadisticas.totalProductos} artículos en stock</p>
                </div>

                {/* Compras / Inversión */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-md"><Icon name="ShoppingCart" size={18} /></div>
                        <h3 className="text-sm font-semibold text-gray-600">Inversión (Compras)</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(comprasTotales)}</p>
                    <p className="text-xs text-gray-500 mt-1">Capital inyectado</p>
                </div>

                {/* Pérdidas por Merma */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-50 text-red-600 rounded-md"><Icon name="TrendingDown" size={18} /></div>
                        <h3 className="text-sm font-semibold text-gray-600">Pérdidas (Mermas)</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(mermasTotales)}</p>
                    <p className="text-xs text-gray-500 mt-1">Por caducidad o daños</p>
                </div>
            </div>

            {/* SECCIÓN INFERIOR: GRÁFICOS Y DISTRIBUCIÓN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Flujo de Capital */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Icon name="PieChart" size={18} className="text-gray-400"/>
                        Distribución del Flujo de Capital
                    </h3>
                    
                    <div className="space-y-6">
                        {/* Barra Ventas */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-600">Ingresos (Ventas)</span>
                                <span className="font-bold text-emerald-600">{porcentajeVentas}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${porcentajeVentas}%` }}></div>
                            </div>
                        </div>

                        {/* Barra Compras */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-600">Inversión (Compras)</span>
                                <span className="font-bold text-purple-600">{porcentajeCompras}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${porcentajeCompras}%` }}></div>
                            </div>
                        </div>

                        {/* Barra Mermas */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-600">Pérdidas (Mermas)</span>
                                <span className="font-bold text-red-600">{porcentajeMermas}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div className="bg-red-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${porcentajeMermas}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen de Salud del Inventario */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Icon name="Activity" size={18} className="text-gray-400"/>
                        Salud del Inventario Actual
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                            <Icon name="CheckCircle" size={28} className="text-emerald-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Productos Sanos</p>
                            <p className="text-xl font-bold text-gray-800">
                                {estadisticas.totalProductos - estadisticas.vencidos - estadisticas.criticos - estadisticas.atencion}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                            <Icon name="AlertTriangle" size={28} className="text-orange-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">En Riesgo / Críticos</p>
                            <p className="text-xl font-bold text-gray-800">
                                {estadisticas.criticos + estadisticas.atencion}
                            </p>
                        </div>

                        <div className="col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                                    <Icon name="XOctagon" size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-800">Productos Vencidos</p>
                                    <p className="text-xs text-gray-500">Requieren baja inmediata</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-red-600">{estadisticas.vencidos}</span>
                        </div>
                    </div>
                </div>

                


            </div>

            {/* NUEVA SECCIÓN: REPORTE MENSUAL DE COMPLIANCE */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-8">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Icon name="CalendarCheck" size={20} className="text-emerald-600" />
                            Reporte Mensual de Cierres (Compliance)
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Acumulado de ingresos para declaraciones fiscales.</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Periodo</th>
                                <th className="px-6 py-4 font-semibold text-center">Días Operados</th>
                                <th className="px-6 py-4 font-semibold text-right">Ventas Registradas (Ingresos)</th>
                                <th className="px-6 py-4 font-semibold text-right">Efectivo Contado</th>
                                <th className="px-6 py-4 font-semibold text-right">Diferencia Neta</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ventasMensuales.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No hay cortes de caja registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                ventasMensuales.map((mes) => (
                                    <tr key={mes.clave} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-gray-800 capitalize">
                                            {mes.mesNombre}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            {mes.diasOperados} días
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-blue-600">
                                            {formatCurrency(mes.ventasTotales)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-700">
                                            {formatCurrency(mes.montoCierre)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${mes.diferencia === 0 ? 'bg-emerald-100 text-emerald-700' : mes.diferencia > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                {formatCurrency(mes.diferencia)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}