import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { corteService } from '../services/corteService.js'; // Importamos el servicio que creaste

export default function PuntoVentaView({
    productos,
    formatCurrency,
    registrarMovimiento,
    movimientos // Recibimos los movimientos para calcular las ventas de hoy
}) {
    // ESTADOS DEL CARRITO
    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState([]);
    const [pagoCliente, setPagoCliente] = useState('');

    // ESTADOS DEL MODAL DE CORTE DE CAJA
    const [showModalCorte, setShowModalCorte] = useState(false);
    const [fondoInicial, setFondoInicial] = useState('');
    const [efectivoContado, setEfectivoContado] = useState('');
    const [notasCorte, setNotasCorte] = useState('');
    const [procesandoCorte, setProcesandoCorte] = useState(false);

    // Filtros de búsqueda
    const productosDisponibles = productos.filter(p => p.cantidad > 0);
    const productosFiltrados = productosDisponibles.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busqueda.toLowerCase())
    );

    // ATAJO DE TECLADO: Presionar Enter para agregar el primer producto
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && productosFiltrados.length > 0) {
            agregarAlCarrito(productosFiltrados[0]);
            setBusqueda(''); 
        }
    };

    // LÓGICA DEL CARRITO
    const agregarAlCarrito = (producto) => {
        setCarrito(prev => {
            const itemExistente = prev.find(item => item.producto.id === producto.id);
            if (itemExistente) {
                if (itemExistente.cantidad + 1 > producto.cantidad) {
                    alert(`Solo tienes ${producto.cantidad} unidades de ${producto.nombre} en stock.`);
                    return prev;
                }
                return prev.map(item => 
                    item.producto.id === producto.id 
                        ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * (producto.precio_venta || 0) }
                        : item
                );
            }
            return [...prev, { producto, cantidad: 1, subtotal: Number(producto.precio_venta) || 0 }];
        });
    };

    const modificarCantidad = (productoId, delta) => {
        setCarrito(prev => {
            return prev.map(item => {
                if (item.producto.id === productoId) {
                    const nuevaCantidad = item.cantidad + delta;
                    if (nuevaCantidad > item.producto.cantidad) {
                        alert(`Stock máximo alcanzado (${item.producto.cantidad}).`);
                        return item;
                    }
                    if (nuevaCantidad === 0) return null;
                    return { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * (item.producto.precio_venta || 0) };
                }
                return item;
            }).filter(Boolean);
        });
    };

    // MATEMÁTICAS DE LA CAJA (TICKET)
    const totalVenta = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    const cambio = Number(pagoCliente) > 0 ? Number(pagoCliente) - totalVenta : 0;
    const pagoSuficiente = Number(pagoCliente) >= totalVenta;

    const procesarVenta = () => {
        if (carrito.length === 0) return;
        if (!window.confirm(`¿Confirmar venta por ${formatCurrency(totalVenta)}?`)) return;

        carrito.forEach(item => {
            registrarMovimiento('SALIDA', item.producto, item.cantidad, 'Venta en mostrador (Caja)');
        });

        setCarrito([]);
        setPagoCliente('');
        setBusqueda('');
    };

    // ==========================================
    // MATEMÁTICAS DEL CORTE DE CAJA (MODAL)
    // ==========================================
    
    // Sumamos solo las ventas de HOY
    const ventasHoy = movimientos
        ? movimientos
            .filter(m => m.tipo === 'SALIDA' && new Date(m.fecha_hora).toDateString() === new Date().toDateString())
            .reduce((sum, m) => sum + (Number(m.valor_total) || 0), 0)
        : 0;

    const totalEsperado = Number(fondoInicial || 0) + ventasHoy;
    const diferenciaCorte = Number(efectivoContado || 0) - totalEsperado;

    const handleConfirmarCorte = async () => {
        if (efectivoContado === '') {
            alert("Por favor ingresa cuánto efectivo contaste en la caja.");
            return;
        }

        if (!window.confirm("¿Estás seguro de registrar el corte? Verifica que el dinero contado sea correcto.")) return;

        setProcesandoCorte(true);
        try {
            await corteService.registrarCorte({
                montoApertura: Number(fondoInicial || 0),
                ventasTotales: ventasHoy,
                montoCierre: Number(efectivoContado),
                diferencia: diferenciaCorte,
                notas: notasCorte
            });
            alert("¡Corte de caja registrado en la base de datos con éxito!");
            setShowModalCorte(false);
            setFondoInicial('');
            setEfectivoContado('');
            setNotasCorte('');
        } catch (error) {
            alert("Hubo un error al guardar el corte. Revisa tu conexión.");
        } finally {
            setProcesandoCorte(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full relative">
            
            {/* LADO IZQUIERDO: CATÁLOGO Y BUSCADOR */}
            <div className="flex-1 flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4 items-center justify-between">
                    <div className="relative w-full">
                        <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Buscar producto (Presiona Enter para agregar)..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onKeyDown={handleKeyDown} 
                        />
                    </div>
                    {/* BOTÓN PARA CERRAR TURNO */}
                    <button 
                        onClick={() => setShowModalCorte(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium whitespace-nowrap shadow-sm"
                    >
                        <Icon name="Lock" size={18} />
                        Cerrar Turno
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {productosFiltrados.map(producto => (
                            <button
                                key={producto.id}
                                onClick={() => agregarAlCarrito(producto)}
                                className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-left active:scale-95"
                            >
                                <div className="text-sm text-gray-500 font-medium mb-1">{producto.categoria}</div>
                                <div className="font-bold text-gray-800 leading-tight mb-2 flex-1">{producto.nombre}</div>
                                <div className="flex justify-between items-end w-full mt-2">
                                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Stock: {producto.cantidad}</span>
                                    <span className="text-lg font-bold text-gray-900">{formatCurrency(producto.precio_venta || 0)}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* LADO DERECHO: TICKET / CARRITO (Se mantiene igual que antes) */}
            <div className="w-full lg:w-[400px] flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm h-[600px] lg:h-auto">
                {/* ... (Todo el contenido del ticket de la versión anterior va aquí) ... */}
                <div className="p-4 border-b border-gray-200 bg-slate-900 text-white rounded-t-xl flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2"><Icon name="Receipt" size={20} />Ticket</h3>
                    <span className="bg-slate-700 px-2 py-1 rounded text-sm">{carrito.length} items</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
                    {carrito.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                            <Icon name="ShoppingCart" size={48} className="opacity-20" /><p>Carrito vacío</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {carrito.map(item => (
                                <div key={item.producto.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between gap-2">
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 text-sm">{item.producto.nombre}</p>
                                        <p className="text-xs text-gray-500">{formatCurrency(item.producto.precio_venta || 0)} c/u</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                        <button onClick={() => modificarCantidad(item.producto.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded text-gray-600 hover:text-red-600"><Icon name="Minus" size={14}/></button>
                                        <span className="w-6 text-center font-bold text-sm">{item.cantidad}</span>
                                        <button onClick={() => modificarCantidad(item.producto.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded text-gray-600 hover:text-emerald-600"><Icon name="Plus" size={14}/></button>
                                    </div>
                                    <div className="text-right w-20 font-bold text-gray-800">{formatCurrency(item.subtotal)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl space-y-4">
                    <div className="flex justify-between items-center text-2xl">
                        <span className="text-gray-500 font-medium">Total:</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(totalVenta)}</span>
                    </div>
                    {carrito.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-600">Efectivo recibido:</label>
                                <input 
                                    type="number" min="0"
                                    className="w-28 text-right p-1 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 font-bold"
                                    placeholder="$ 0.00" value={pagoCliente} onChange={(e) => setPagoCliente(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Cambio:</span>
                                <span className={`font-bold text-lg ${cambio > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {pagoCliente ? formatCurrency(cambio) : '$0.00'}
                                </span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={procesarVenta}
                        disabled={carrito.length === 0 || (pagoCliente && !pagoSuficiente)}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-md
                            ${carrito.length === 0 ? 'bg-gray-200 text-gray-400 shadow-none' : (pagoCliente && !pagoSuficiente) ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                    >
                        <Icon name="Banknote" size={24} />
                        {(pagoCliente && !pagoSuficiente) ? 'Pago Insuficiente' : 'COBRAR TICKET'}
                    </button>
                </div>
            </div>

            {/* ========================================== */}
            {/* MODAL DE CORTE DE CAJA */}
            {/* ========================================== */}
            {showModalCorte && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
                        
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Icon name="Calculator" size={24} className="text-emerald-600" />
                                Corte de Caja (Hoy)
                            </h2>
                            <button onClick={() => setShowModalCorte(false)} className="text-gray-400 hover:text-red-500">
                                <Icon name="X" size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Fondo Inicial */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fondo Inicial (Con cuánto abriste)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input 
                                        type="number" 
                                        value={fondoInicial} 
                                        onChange={(e) => setFondoInicial(e.target.value)}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Ej: 500"
                                    />
                                </div>
                            </div>

                            {/* Ventas Registradas (Automático) */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Ventas del Sistema (Hoy):</span>
                                <span className="font-bold text-gray-800">{formatCurrency(ventasHoy)}</span>
                            </div>

                            {/* Total Esperado */}
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 flex justify-between items-center">
                                <span className="text-emerald-800 font-bold">Total Esperado en Cajón:</span>
                                <span className="font-bold text-emerald-600 text-xl">{formatCurrency(totalEsperado)}</span>
                            </div>

                            {/* Efectivo Contado */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-1">Efectivo Físico Contado</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        value={efectivoContado} 
                                        onChange={(e) => setEfectivoContado(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 outline-none font-bold text-lg"
                                        placeholder="¿Cuánto dinero hay realmente?"
                                    />
                                </div>
                            </div>

                            {/* Resultado Visual de la Diferencia */}
                            {efectivoContado !== '' && (
                                <div className={`p-3 rounded-lg flex items-center justify-between text-white font-bold
                                    ${diferenciaCorte === 0 ? 'bg-emerald-500' : diferenciaCorte > 0 ? 'bg-blue-500' : 'bg-red-500'}
                                `}>
                                    <span>
                                        {diferenciaCorte === 0 ? '¡Caja Cuadrada Perfecta!' : diferenciaCorte > 0 ? 'Sobrante:' : 'Faltante:'}
                                    </span>
                                    <span>{formatCurrency(Math.abs(diferenciaCorte))}</span>
                                </div>
                            )}

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observaciones</label>
                                <input 
                                    type="text" 
                                    value={notasCorte} 
                                    onChange={(e) => setNotasCorte(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Ej: Faltan $5 de un cambio, pagué la coca..."
                                />
                            </div>
                        </div>

                        {/* Botón Guardar */}
                        <button
                            onClick={handleConfirmarCorte}
                            disabled={procesandoCorte}
                            className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
                        >
                            {procesandoCorte ? 'Guardando...' : 'Confirmar y Guardar Corte'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}