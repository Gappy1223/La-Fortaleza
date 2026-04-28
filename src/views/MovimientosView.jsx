import { useState } from 'react';
import Icon from '../components/Icon.jsx';

const toDateInput = (date) => date.toISOString().split('T')[0];

export default function MovimientosView({ movimientos, formatCurrency }) {
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('TODOS');

    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const [fechaDesde, setFechaDesde] = useState(toDateInput(primerDiaMes));
    const [fechaHasta, setFechaHasta] = useState(toDateInput(hoy));

    const aplicarPeriodo = (periodo) => {
        const ahora = new Date();
        if (periodo === 'hoy') {
            const d = toDateInput(ahora);
            setFechaDesde(d);
            setFechaHasta(d);
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
            setFechaDesde('');
            setFechaHasta('');
        }
    };

    const movimientosFiltrados = movimientos.filter(m => {
        const fecha = new Date(m.fecha_hora);
        if (fechaDesde && fecha < new Date(fechaDesde + 'T00:00:00')) return false;
        if (fechaHasta && fecha > new Date(fechaHasta + 'T23:59:59')) return false;
        const coincideBusqueda =
            m.producto_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            m.notas?.toLowerCase().includes(busqueda.toLowerCase());
        const coincideTipo = filtroTipo === 'TODOS' || m.tipo === filtroTipo;
        return coincideBusqueda && coincideTipo;
    });

    const formatearFechaHora = (fechaString) => {
        return new Date(fechaString).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getEstiloTipo = (tipo) => {
        switch (tipo) {
            case 'ENTRADA': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'SALIDA':  return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'MERMA':   return 'bg-red-100 text-red-700 border-red-200';
            case 'GASTO':   return 'bg-amber-100 text-amber-700 border-amber-200';
            default:        return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getIconoTipo = (tipo) => {
        switch (tipo) {
            case 'ENTRADA': return 'ArrowDownToLine';
            case 'SALIDA':  return 'ArrowUpFromLine';
            case 'MERMA':   return 'Trash2';
            case 'GASTO':   return 'Banknote';
            default:        return 'Activity';
        }
    };

    const periodos = [
        { id: 'hoy',    label: 'Hoy' },
        { id: 'semana', label: '7 días' },
        { id: 'mes',    label: 'Este mes' },
        { id: 'todo',   label: 'Todo' },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">

            {/* HEADER: título + búsqueda + tipo */}
            <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600">
                            <Icon name="History" size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Historial de Movimientos</h3>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por producto o nota..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            />
                        </div>
                        <select
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm font-medium text-gray-700"
                        >
                            <option value="TODOS">Todos los tipos</option>
                            <option value="ENTRADA">Entradas</option>
                            <option value="SALIDA">Salidas (Ventas)</option>
                            <option value="MERMA">Mermas</option>
                        </select>
                    </div>
                </div>

                {/* FILTRO DE FECHA */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
                        {periodos.map(p => (
                            <button
                                key={p.id}
                                onClick={() => aplicarPeriodo(p.id)}
                                className="px-3 py-1.5 rounded-md text-xs font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={15} className="text-gray-400" />
                        <input
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="text-gray-400">—</span>
                        <input
                            type="date"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <span className="text-xs text-gray-400 ml-auto">
                        {movimientosFiltrados.length} resultado{movimientosFiltrados.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* TABLA */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Fecha y Hora</th>
                            <th className="px-6 py-4 font-semibold">Tipo</th>
                            <th className="px-6 py-4 font-semibold">Producto</th>
                            <th className="px-6 py-4 font-semibold text-right">Cantidad</th>
                            <th className="px-6 py-4 font-semibold text-right">Valor Total</th>
                            <th className="px-6 py-4 font-semibold">Usuario / Notas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {movimientosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Icon name="ClipboardList" size={48} className="text-gray-300 mb-4" />
                                        <p className="text-lg font-medium text-gray-600">Sin movimientos en este período</p>
                                        <p className="text-sm mt-1">Ajusta el rango de fechas o los filtros.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            movimientosFiltrados.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        {formatearFechaHora(m.fecha_hora)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getEstiloTipo(m.tipo)}`}>
                                            <Icon name={getIconoTipo(m.tipo)} size={14} />
                                            {m.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{m.producto_nombre}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-semibold text-gray-800">
                                            {m.tipo === 'SALIDA' || m.tipo === 'MERMA' || m.tipo === 'GASTO' ? '-' : '+'}{m.cantidad}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-700">
                                        {formatCurrency ? formatCurrency(m.valor_total) : `$${m.valor_total}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-800">{m.usuario || 'Sistema'}</div>
                                        {m.notas && (
                                            <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs" title={m.notas}>
                                                {m.notas}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
