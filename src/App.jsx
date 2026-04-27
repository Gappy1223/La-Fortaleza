import { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { productService } from "./services/productService.js";
import { movementService } from "./services/movementService.js";
import { corteService } from "./services/corteService.js";
import Icon from "./components/Icon.jsx";
import StockInForm from "./components/StockInForm.jsx";
import ProductForm from "./components/ProductForm.jsx";
import DashboardView from "./views/DashboardView.jsx";
import InventarioView from "./views/InventarioView.jsx";
import AlertasView from "./views/AlertasView.jsx";
import MovimientosView from "./views/MovimientosView.jsx";
import ReportesView from "./views/ReportesView.jsx";
import PuntoVentaView from "./views/PuntoVentaView.jsx";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const calculateDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const getAlertLevel = (daysUntilExpiry) => {
    if (daysUntilExpiry < 0) return 'VENCIDO';
    if (daysUntilExpiry <= 3) return 'CRITICO';
    if (daysUntilExpiry <= 7) return 'ATENCION';
    return 'OK';
};

/*const getAlertColor = (level) => {
    switch(level) {
        case 'VENCIDO': return 'bg-gray-100 border-gray-400 text-gray-700';
        case 'CRITICO': return 'bg-red-100 border-red-500 text-red-700';
        case 'ATENCION': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
        default: return 'bg-green-100 border-green-500 text-green-700';
    }
};*/

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function App() {
    // Estados
    const [currentView, setCurrentView] = useState('caja');
    const [productos, setProductos] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('TODOS');
    const [cortesCaja, setCortesCaja] = useState([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [ventasPendientes, setVentasPendientes] = useState(()=> JSON.parse(localStorage.getItem('ventas_pendientes') || '[]'));
    const [showStockInModal, setShowStockInModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(()=>{
        const handleOnline = ()=>{
            setIsOnline(true);
            sincronizarVentasPendientes();
        };
        const handleOffline = ()=> setIsOnline(false);
        window,addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);



    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            if(!navigator.onLine){
                throw new Error("Sin conexión a internet");
            }

            // Cargar productos
            const { data: productosData, error: productosError } = await productService.getAll();
            if (productosError) throw productosError;
            // Cargar movimientos
            const { data: movimientosData, error: movimientosError } = await movementService.getAll()
            if (movimientosError) throw movimientosError;

            const cortesData = await corteService.obtenerHistorialCortes();
            localStorage.setItem('cache_productos', JSON.stringify(productosData || []));

            setProductos(productosData || []);
            setMovimientos(movimientosData || []);
            setCortesCaja(cortesData || []);
        } catch (err) {
            console.warn('Modo offline: cargando datos desde cache', err);
            const productosCache = JSON.parse(localStorage.getItem('cache_productos') || '[]');
            if (productosCache.length > 0) {
                setProductos(productosCache);
            } else {
                setError('No hay internet y no hay datos guardados previamente. Por favor, conecta a internet para cargar los datos por primera vez.');
            }
        } finally {
            setLoading(false);
        }
    };

    const saveProduct = async (productData) => {
        try{
            if (editingProduct){
                const { error} = await productService.update(editingProduct.id, productData);
                if (error) throw error;
            } else {
                const { error } = await productService.create(productData);
                if (error) throw error;
                
                await movementService.create({
                    tipo: 'ENTRADA',
                    producto_id: productData.id,
                    producto_nombre: productData.nombre,
                    cantidad: productData.cantidad,
                    fecha_hora: new Date().toISOString(),
                    usuario: 'Sistema',
                    notas: 'Ingreso inicial al crear producto',
                    valor_total: productData.precio_compra * productData.cantidad
                });
            }
            await loadData();
            setShowForm(false);
            setEditingProduct(null);
        } catch (err) {
            console.error('Error guardando producto:', err);
            alert('Error al guardar el producto. Por favor, intenta de nuevo.');
        }
    };

    const deleteProduct = async (productId) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
           const { error } = await productService.delete(productId);
           if (error) throw error;
           await loadData();
        } catch (err) {
            console.error('Error eliminando producto:', err);
            alert('Error al eliminar el producto.');
        }
    };


    const registrarMovimiento = async (tipo, producto, cantidad, notas = '') => {
        const valorTotal = tipo === 'SALIDA'
                    ? producto.precio_venta * cantidad
                    : producto.precio_compra * cantidad;

        const nuevaCantidad = tipo === 'ENTRADA'
            ? producto.cantidad + cantidad
            : producto.cantidad - cantidad;

        // 1. ACTUALIZAR INTERFAZ INMEDIATAMENTE (Para que el cajero siga cobrando rápido)
        setProductos(prev => prev.map(p => p.id === producto.id ? { ...p, cantidad: nuevaCantidad } : p));

        const paqueteMovimiento = {
            tipo,
            producto_id: producto.id,
            producto_nombre: producto.nombre,
            cantidad,
            fecha_hora: new Date().toISOString(),
            usuario: 'Usuario',
            notas: isOnline ? notas : `(OFFLINE) ${notas}`,
            valor_total: valorTotal,
            nueva_cantidad: nuevaCantidad
        };

        // 2. SI NO HAY INTERNET, GUARDAR EN LA COLA
        if (!isOnline) {
            const colaAct = [...ventasPendientes, paqueteMovimiento];
            setVentasPendientes(colaAct);
            localStorage.setItem('ventas_pendientes', JSON.stringify(colaAct));
            return; // Terminamos aquí sin intentar usar Supabase
        }

        // 3. SI HAY INTERNET, GUARDAR DIRECTO EN SUPABASE
        try {
            await movementService.create(paqueteMovimiento);
            await productService.update(producto.id, { cantidad: nuevaCantidad });
            await loadData();
        } catch (err) {
            console.error('Error registrando:', err);
            alert('Error al sincronizar el movimiento con la nube.');
        }
    };


    const sincronizarVentasPendientes = async () => {
        const cola = JSON.parse(localStorage.getItem('ventas_pendientes') || '[]');
        if (cola.length === 0) return;

        try {
            for (const mov of cola) {
                // Subir movimiento a Supabase
                await movementService.create(mov);
                // Actualizar inventario en Supabase
                await productService.update(mov.producto_id, { cantidad: mov.nueva_cantidad });
            }
            
            // Si todo salió bien, vaciamos la libreta
            localStorage.setItem('ventas_pendientes', '[]');
            setVentasPendientes([]);
            await loadData(); // Recargamos para asegurar sincronía total
            alert('¡Conexión recuperada! Todas las ventas offline han sido sincronizadas.');
        } catch (error) {
            console.error("Error sincronizando ventas atrasadas", error);
        }
    };



    const productosConAlertas = useMemo(() => {
        return productos.map(p => ({
            ...p,
            diasRestantes: calculateDaysUntilExpiry(p.fecha_caducidad),
            nivelAlerta: getAlertLevel(calculateDaysUntilExpiry(p.fecha_caducidad))
        }));
    }, [productos]);

    const productosFiltrados = useMemo(() => {
        return productosConAlertas.filter(p => {
            const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               p.codigo_barras?.includes(searchTerm);
            const matchCategory = filterCategory === 'TODOS' || p.categoria === filterCategory;
            return matchSearch && matchCategory;
        });
    }, [productosConAlertas, searchTerm, filterCategory]);

    const estadisticas = useMemo(() => {
        const criticos = productosConAlertas.filter(p => p.nivelAlerta === 'CRITICO' && p.cantidad > 0).length;
        const atencion = productosConAlertas.filter(p => p.nivelAlerta === 'ATENCION' && p.cantidad > 0).length;
        const vencidos = productosConAlertas.filter(p => p.nivelAlerta === 'VENCIDO' && p.cantidad > 0).length;
        const valorTotal = productos.reduce((sum, p) => sum + (p.cantidad * p.precio_venta), 0);
        const totalProductos = productos.reduce((sum, p) => sum + p.cantidad, 0);

        return { criticos, atencion, vencidos, valorTotal, totalProductos };
    }, [productosConAlertas, productos]);

    const handleConfirmStockIn = async (formData) => {
        try{
            const nuevoTotal = Number(selectedProduct.cantidad) + Number(formData.cantidadSuma);
            const { error: prodError} = await productService.update(selectedProduct.id, {
                ...selectedProduct,
                cantidad: nuevoTotal,
                precio_compra: Number(formData.nuevoCosto),
                fecha_caducidad: formData.nuevaCaducidad,
                updated_at: new Date().toISOString()
            });
            if (prodError) throw prodError;
            const { error: movError } = await movementService.create({
                tipo: 'ENTRADA',
                producto_id: selectedProduct.id,
                producto_nombre: selectedProduct.nombre,
                cantidad: Number(formData.cantidadSuma),
                usuario: 'Administrador',
                notas: formData.notas || 'Reabastecimiento de inventario',
                valor_total: Number(formData.nuevoCosto) + Number(formData.cantidadSuma)
            });
            if (movError) throw movError;
            await loadData();
            setShowStockInModal(false);
            setSelectedProduct(null);
            alert('Inventario actualizado correctamente');
        } catch (error){
            console.error('Error en reabastecimiento:', error);
            alert("Error al actualizar el inventario:" + error.message);
        }
    };


    // ============================================
    // RENDERIZADO PRINCIPAL
    // ============================================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <div className="text-gray-500 font-medium">Cargando datos...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-lg">
                    <div className="text-red-700 font-bold text-xl mb-2">Error de Conexión</div>
                    <div className="text-red-600 mb-4">{error}</div>
                    <div className="text-sm text-gray-600 mb-4">
                        Por favor, verifica que has configurado correctamente las credenciales de Supabase en el archivo app.jsx
                    </div>
                    <button
                        onClick={loadData}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const menuItems = [
        { id: 'caja', label: 'Caja / POS', icon: 'ShoppingCart'},
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard'},
        { id: 'inventario', label: 'Inventario', icon: 'Package'},
        { id: 'alertas', label: 'Alertas', icon: 'Bell'},
        { id: 'movimientos', label: 'Movimientos', icon: 'ArrowLeftRight'},
        { id: 'reportes', label: 'Reportes', icon: 'BarChart3'}
    ]

    const currentMenuLabel = menuItems.find(m=>m.id === currentView)?.label;

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Barra lateral */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
                {/* Logo y título */}
                <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
                    <Icon name="Shield" size={24} className="text-emerald-500 mr-3" />
                    <h1 className="text-xl font-bold text-white tracking-wide">La Fortaleza</h1>
                </div>

                {/* Menú de navegación */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menú Principal</div>
                    {menuItems.map(nav=>(
                        <button
                            key={nav.id}
                            onClick={()=>setCurrentView(nav.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                                currentView == nav.id
                                    ? 'bg-emerald-600/10 text-emerald-400 font-medium'
                                    : 'hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <Icon name={nav.icon} size={20} className={currentView === nav.id ? 'text-emerald-400' : 'text-slate-400'} />
                            <span className="text-sm">
                                {nav.label}
                            </span>
                        </button>
                    ))}
                </nav>
            
                {/* Bottom User Area */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <div className="flex-1 text-sm text-left">
                            <p className="text-white font-medium">Administrador</p>
                            <p className="text-slate-500 text-xs">correo</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Area Principal */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {currentMenuLabel}
                    </h2>
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors text-sm font-medium"
                        >
                            <Icon name="RefreshCw" size={16} />
                            Actualizar Datos
                        </button>
                </header>

                    {/* Contenido Principal */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
                        <div className="max-w-7xl mx-auto">
                            
                            {currentView === 'caja' && (
                                <PuntoVentaView
                                    productos={productos}
                                    formatCurrency={formatCurrency}
                                    registrarMovimiento={registrarMovimiento}
                                    movimientos={movimientos}
                                />
                            )}
                            
                            
                            {currentView === 'dashboard' && (
                                <DashboardView
                                    estadisticas={estadisticas}
                                    productos={productos}
                                    productosConAlertas={productosConAlertas}
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                    setCurrentView={setCurrentView}
                                    registrarMovimiento={registrarMovimiento}
                                />
                            )}

                            {currentView === 'inventario' && (
                                <InventarioView
                                    productos={productos}
                                    formatCurrency={formatCurrency}
                                    setEditingProduct={setEditingProduct}
                                    setShowForm={setShowForm}
                                    deleteProduct={deleteProduct}
                                    onStockIn={(producto)=>{
                                        setSelectedProduct(producto);
                                        setShowStockInModal(true)
                                    }}
                                    registrarMovimiento={registrarMovimiento}
                                    formatDate={formatDate}

                                />
                            )}

                            {currentView === 'alertas' && (
                                <AlertasView
                                    productosConAlertas={productosConAlertas}
                                    registrarMovimiento={registrarMovimiento}
                                    formatDate={formatDate}
                                />
                            )}

                            {currentView === 'movimientos' && (
                                <MovimientosView
                                    movimientos={movimientos}
                                    formatCurrency={formatCurrency}
                                />
                            )}

                            {currentView === 'reportes' && (
                                <ReportesView
                                    movimientos={movimientos}
                                    estadisticas={estadisticas}
                                    cortesCaja={cortesCaja}
                                    formatCurrency={formatCurrency}
                                />
                            )}
                        </div>
                    </main>
            </div>

            

            {/* Formulario Modal */}
            {showForm && (
                <ProductForm
                    product={editingProduct}
                    onSave={saveProduct}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                    }}
                />
            )}

            {showStockInModal && (
                <StockInForm
                    product={selectedProduct}
                    onSave={handleConfirmStockIn}
                    onCancel={()=>{
                        setShowStockInModal(false);
                        setSelectedProduct(null);
                    }}
                />
            )}
        </div>
    );
}

export default App;




/*const utils = {
    formatCurrency,
    formatDate,
    calculateDaysUntilExpiry,
    getAlertLevel,
    getAlertColor
}*/