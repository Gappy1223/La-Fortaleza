import { useState, useMemo } from 'react';
import Icon from '../components/Icon.jsx';

const toDateInput = (date) => date.toISOString().split('T')[0];

export default function ReportesView({ movimientos, productos, estadisticas, cortesCaja, formatCurrency }) {

    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const [fechaDesde, setFechaDesde] = useState(toDateInput(primerDiaMes));
    const [fechaHasta, setFechaHasta] = useState(toDateInput(hoy));

    const [sortField, setSortField] = useState('utilidad');
    const [sortDir, setSortDir]     = useState('desc');

    const aplicarPeriodo = (periodo) => {
        const ahora = new Date();
        if (periodo === 'hoy') {
            const d = toDateInput(ahora);
            setFechaDesde(d); setFechaHasta(d);
        } else if (periodo === 'semana') {
            const hace7 = new Date(ahora);
            hace7.setDate(ahora.getDate() - 6);
            setFechaDesde(toDateInput(hace7));
            setFechaHasta(toDateInput(ahora));
        } else if (periodo === 'mes') {
            const primer = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
            setFechaDesde(toDateInput(primer));
            setFechaHasta(toDateInput(ahora));
        } else if (periodo === 'todo') {
            setFechaDesde(''); setFechaHasta('');
        }
    };

    const periodos = [
        { id: 'hoy',    label: 'Hoy' },
        { id: 'semana', label: '7 días' },
        { id: 'mes',    label: 'Este mes' },
        { id: 'todo',   label: 'Todo' },
    ];

    const movimientosFiltrados = useMemo(() => {
        return movimientos.filter(m => {
            const fecha = new Date(m.fecha_hora);
            if (fechaDesde && fecha < new Date(fechaDesde + 'T00:00:00')) return false;
            if (fechaHasta && fecha > new Date(fechaHasta + 'T23:59:59')) return false;
            return true;
        });
    }, [movimientos, fechaDesde, fechaHasta]);

    // Cálculos financieros sobre el período seleccionado
    const ventasTotales  = movimientosFiltrados.filter(m => m.tipo === 'SALIDA').reduce((s, v) => s + (v.valor_total || 0), 0);
    const mermasTotales  = movimientosFiltrados.filter(m => m.tipo === 'MERMA') .reduce((s, v) => s + (v.valor_total || 0), 0);
    const comprasTotales = movimientosFiltrados.filter(m => m.tipo === 'ENTRADA').reduce((s, v) => s + (v.valor_total || 0), 0);
    const itemsVendidos  = movimientosFiltrados.filter(m => m.tipo === 'SALIDA').reduce((s, v) => s + (v.cantidad   || 0), 0);

    // Utilidad por producto
    const utilidadPorProducto = useMemo(() => {
        const acum = {};
        movimientosFiltrados
            .filter(m => m.tipo === 'SALIDA')
            .forEach(m => {
                if (!acum[m.producto_id]) {
                    acum[m.producto_id] = { producto_id: m.producto_id, nombre: m.producto_nombre, unidades: 0, ingreso: 0 };
                }
                acum[m.producto_id].unidades += m.cantidad    || 0;
                acum[m.producto_id].ingreso  += m.valor_total || 0;
            });

        return Object.values(acum).map(item => {
            const prod       = (productos || []).find(p => p.id === item.producto_id);
            const pCompra    = prod?.precio_compra || 0;
            const pVenta     = prod?.precio_venta  || 0;
            const categoria  = prod?.categoria     || '—';
            const costo      = pCompra * item.unidades;
            const utilidad   = item.ingreso - costo;
            const margen     = item.ingreso > 0 ? (utilidad / item.ingreso) * 100 : 0;
            return { ...item, categoria, pCompra, pVenta, costo, utilidad, margen };
        });
    }, [movimientosFiltrados, productos]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const utilidadOrdenada = useMemo(() => {
        return [...utilidadPorProducto].sort((a, b) => {
            const mult = sortDir === 'asc' ? 1 : -1;
            if (typeof a[sortField] === 'string') return mult * a[sortField].localeCompare(b[sortField]);
            return mult * ((a[sortField] || 0) - (b[sortField] || 0));
        });
    }, [utilidadPorProducto, sortField, sortDir]);

    const totalUtilidad  = utilidadPorProducto.reduce((s, r) => s + r.utilidad, 0);
    const totalIngreso   = utilidadPorProducto.reduce((s, r) => s + r.ingreso,  0);
    const totalCosto     = utilidadPorProducto.reduce((s, r) => s + r.costo,    0);
    const totalUnidades  = utilidadPorProducto.reduce((s, r) => s + r.unidades, 0);
    const margenGlobal   = totalIngreso > 0 ? (totalUtilidad / totalIngreso) * 100 : 0;

    const badgeMargen = (m) => {
        if (m >= 30) return 'bg-emerald-100 text-emerald-700';
        if (m >= 15) return 'bg-amber-100 text-amber-700';
        return 'bg-red-100 text-red-700';
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <Icon name="ChevronsUpDown" size={13} className="text-gray-300 ml-1 inline" />;
        return sortDir === 'asc'
            ? <Icon name="ChevronUp"   size={13} className="text-emerald-500 ml-1 inline" />
            : <Icon name="ChevronDown" size={13} className="text-emerald-500 ml-1 inline" />;
    };

    const thSort = (field, label, align = 'right') => (
        <th
            className={`px-5 py-4 font-semibold cursor-pointer select-none hover:text-gray-800 transition-colors text-${align}`}
            onClick={() => handleSort(field)}
        >
            {label}<SortIcon field={field} />
        </th>
    );

    const ventasMensuales = useMemo(() => {
        if (!cortesCaja || cortesCaja.length === 0) return [];
        const grupos = cortesCaja.reduce((acc, corte) => {
            const fecha = new Date(corte.fecha);
            const mesAño = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
            if (!acc[mesAño]) {
                acc[mesAño] = {
                    mesNombre: fecha.toLocaleString('es-MX', { month: 'long', year: 'numeric' }),
                    ventasTotales: 0, montoCierre: 0, diferencia: 0, diasOperados: 0
                };
            }
            acc[mesAño].ventasTotales += Number(corte.ventas_totales) || 0;
            acc[mesAño].montoCierre   += Number(corte.monto_cierre)   || 0;
            acc[mesAño].diferencia    += Number(corte.diferencia)      || 0;
            acc[mesAño].diasOperados  += 1;
            return acc;
        }, {});
        return Object.entries(grupos)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([clave, datos]) => ({ clave, ...datos }));
    }, [cortesCaja]);

    const totalOps = ventasTotales + mermasTotales + comprasTotales;
    const pVentas  = totalOps === 0 ? 0 : Math.round((ventasTotales  / totalOps) * 100);
    const pMermas  = totalOps === 0 ? 0 : Math.round((mermasTotales  / totalOps) * 100);
    const pCompras = totalOps === 0 ? 0 : Math.round((comprasTotales / totalOps) * 100);

    const etiquetaPeriodo = fechaDesde && fechaHasta
        ? `${fechaDesde} — ${fechaHasta}`
        : fechaDesde ? `Desde ${fechaDesde}`
        : fechaHasta ? `Hasta ${fechaHasta}`
        : 'Todo el historial';

    return (
        <div className="space-y-6">

            {/* ENCABEZADO */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5 flex items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Icon name="BarChart3" size={24} /></div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Reportes Financieros</h2>
                        <p className="text-sm text-gray-500">Resumen de operaciones y estado del capital</p>
                    </div>
                </div>
            </div>

            {/* FILTRO DE FECHA */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-4 flex flex-wrap items-center gap-3">
                <Icon name="Calendar" size={18} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Período:</span>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {periodos.map(p => (
                        <button key={p.id} onClick={() => aplicarPeriodo(p.id)}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold text-gray-600 hover:bg-white hover:text-emerald-700 hover:shadow-sm transition-all">
                            {p.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                    <span className="text-gray-400">—</span>
                    <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <span className="text-xs text-gray-400 ml-auto">
                    {movimientosFiltrados.length} movimiento{movimientosFiltrados.length !== 1 ? 's' : ''} · {etiquetaPeriodo}
                </span>
            </div>

            {/* TARJETAS DE MÉTRICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md"><Icon name="TrendingUp" size={18} /></div>
                        <h3 className="text-sm font-semibold text-gray-600">Ingresos Totales</h3>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(ventasTotales)}</p>
                    <p className="text-xs text-gray-500 mt-1">{itemsVendidos} artículos vendidos</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-md"><Icon name="Boxes" size={18} /></div>
                        <h3 className="text-sm font-semibold text-gray-600">Capital en Inventario</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{formatCurrency(estadisticas.valorTotal)}</p>
                    <p className="text-xs text-gray-500 mt-1">{estadisticas.totalProductos} artículos en stock</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-md"><Icon name="ShoppingCart" size={18} /></div>
                        <h3 className="text-sm font-semibold text-gray-600">Inversión (Compras)</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mt-2">{formatCurrency(comprasTotales)}</p>
                    <p className="text-xs text-gray-500 mt-1">Capital inyectado</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-50 text-red-600 rounded-md"><Icon name="TrendingDown" size={18} /></div>
                        <h3 className="text-sm font-semibold text-gray-600">Pérdidas (Mermas)</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(mermasTotales)}</p>
                    <p className="text-xs text-gray-500 mt-1">Por caducidad o daños</p>
                </div>
            </div>

            {/* DISTRIBUCIÓN Y SALUD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Icon name="PieChart" size={18} className="text-gray-400" />
                        Distribución del Flujo de Capital
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Ingresos (Ventas)',    pct: pVentas,  color: 'bg-emerald-500', textColor: 'text-emerald-600' },
                            { label: 'Inversión (Compras)',  pct: pCompras, color: 'bg-purple-500',  textColor: 'text-purple-600'  },
                            { label: 'Pérdidas (Mermas)',    pct: pMermas,  color: 'bg-red-500',     textColor: 'text-red-600'     },
                        ].map(({ label, pct, color, textColor }) => (
                            <div key={label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-600">{label}</span>
                                    <span className={`font-bold ${textColor}`}>{pct}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className={`${color} h-2.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Icon name="Activity" size={18} className="text-gray-400" />
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
                            <p className="text-xl font-bold text-gray-800">{estadisticas.criticos + estadisticas.atencion}</p>
                        </div>
                        <div className="col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-full"><Icon name="XOctagon" size={20} /></div>
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

            {/* UTILIDAD POR PRODUCTO */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Icon name="DollarSign" size={20} className="text-emerald-600" />
                            Utilidad por Producto
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Costo calculado con el precio de compra actual. Haz clic en los encabezados para ordenar.
                        </p>
                    </div>
                    {utilidadOrdenada.length > 0 && (
                        <div className="flex items-center gap-4 text-sm">
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Utilidad del período</p>
                                <p className={`text-lg font-bold ${totalUtilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {formatCurrency(totalUtilidad)}
                                </p>
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${badgeMargen(margenGlobal)}`}>
                                {margenGlobal.toFixed(1)}% margen
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                {thSort('nombre',    'Producto',    'left')}
                                {thSort('categoria', 'Categoría',   'left')}
                                {thSort('unidades',  'Unid. Vendidas')}
                                {thSort('pCompra',   'P. Compra')}
                                {thSort('pVenta',    'P. Venta')}
                                {thSort('ingreso',   'Ingreso')}
                                {thSort('costo',     'Costo')}
                                {thSort('utilidad',  'Utilidad')}
                                {thSort('margen',    'Margen %')}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {utilidadOrdenada.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center text-gray-400">
                                        <Icon name="PackageSearch" size={36} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-medium">No hay ventas en este período</p>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {utilidadOrdenada.map((r) => (
                                        <tr key={r.producto_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5 font-medium text-gray-900">{r.nombre}</td>
                                            <td className="px-5 py-3.5 text-gray-500 text-sm">{r.categoria}</td>
                                            <td className="px-5 py-3.5 text-right font-semibold text-gray-700">{r.unidades}</td>
                                            <td className="px-5 py-3.5 text-right text-gray-500 text-sm">{formatCurrency(r.pCompra)}</td>
                                            <td className="px-5 py-3.5 text-right text-gray-500 text-sm">{formatCurrency(r.pVenta)}</td>
                                            <td className="px-5 py-3.5 text-right font-medium text-gray-700">{formatCurrency(r.ingreso)}</td>
                                            <td className="px-5 py-3.5 text-right text-gray-500">{formatCurrency(r.costo)}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span className={`font-bold ${r.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {formatCurrency(r.utilidad)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeMargen(r.margen)}`}>
                                                    {r.margen.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* FILA TOTALES */}
                                    <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                                        <td className="px-5 py-3.5 text-gray-800" colSpan="2">Total</td>
                                        <td className="px-5 py-3.5 text-right text-gray-800">{totalUnidades}</td>
                                        <td className="px-5 py-3.5" colSpan="2" />
                                        <td className="px-5 py-3.5 text-right text-gray-800">{formatCurrency(totalIngreso)}</td>
                                        <td className="px-5 py-3.5 text-right text-gray-800">{formatCurrency(totalCosto)}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <span className={totalUtilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                                {formatCurrency(totalUtilidad)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badgeMargen(margenGlobal)}`}>
                                                {margenGlobal.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* REPORTE MENSUAL DE COMPLIANCE */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Icon name="CalendarCheck" size={20} className="text-emerald-600" />
                        Reporte Mensual de Cierres (Compliance)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Acumulado de ingresos para declaraciones fiscales.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Periodo</th>
                                <th className="px-6 py-4 font-semibold text-center">Días Operados</th>
                                <th className="px-6 py-4 font-semibold text-right">Ventas Registradas</th>
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
                                        <td className="px-6 py-4 font-bold text-gray-800 capitalize">{mes.mesNombre}</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{mes.diasOperados} días</td>
                                        <td className="px-6 py-4 text-right font-bold text-blue-600">{formatCurrency(mes.ventasTotales)}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-700">{formatCurrency(mes.montoCierre)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                mes.diferencia === 0 ? 'bg-emerald-100 text-emerald-700'
                                                : mes.diferencia > 0 ? 'bg-blue-100 text-blue-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
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
