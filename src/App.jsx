import { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { productService } from "./services/productService.js";
import { movementService } from "./services/movementService.js";
import Icon from "./components/Icon.jsx";
import ProductForm from "./components/ProductForm.jsx";
import DashboardView from "./views/DashboardView.jsx";
import InventarioView from "./views/InventarioView.jsx";
import AlertasView from "./views/AlertasView.jsx";
import MovimientosView from "./views/MovimientosView.jsx";
import ReportesView from "./views/ReportesView.jsx";

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

const getAlertColor = (level) => {
    switch(level) {
        case 'VENCIDO': return 'bg-gray-100 border-gray-400 text-gray-700';
        case 'CRITICO': return 'bg-red-100 border-red-500 text-red-700';
        case 'ATENCION': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
        default: return 'bg-green-100 border-green-500 text-green-700';
    }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function App() {
    // Estados
    const [currentView, setCurrentView] = useState('dashboard');
    const [productos, setProductos] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('TODOS');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar productos
            const { data: productosData, error: productosError } = await productService.getAll();
            if (productosError) throw productosError;
            // Cargar movimientos
            const { data: movimientosData, error: movimientosError } = await movementService.getAll()
            if (movimientosError) throw movimientosError;

            setProductos(productosData || []);
            setMovimientos(movimientosData || []);
        } catch (err) {
            console.error('Error cargando datos:', err);
            setError('Error al cargar los datos. Por favor, verifica tu conexión a Supabase.');
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
        try {
            const valorTotal = tipo === 'SALIDA'
                ? producto.precio_venta * cantidad
                : producto.precio_compra * cantidad;

            const { error: movError } = await movementService.create({
                tipo,
                producto_id: producto.id,
                producto_nombre: producto.nombre,
                cantidad,
                fecha_hora: new Date().toISOString(),
                usuario: 'Usuario',
                notas,
                valor_total: valorTotal
            });
            if (movError) throw movError;

            const nuevaCantidad = tipo === 'ENTRADA'
                ? producto.cantidad + cantidad
                : producto.cantidad - cantidad;

            const { error: updateError } = await productService.update(
                producto.id, { cantidad: nuevaCantidad }
            );
            if (updateError) throw updateError;

            await loadData();
        } catch (err) {
            console.error('Error registrando movimiento:', err);
            alert('Error al registrar el movimiento. Por favor, intenta de nuevo.');
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
        const criticos = productosConAlertas.filter(p => p.nivelAlerta === 'CRITICO').length;
        const atencion = productosConAlertas.filter(p => p.nivelAlerta === 'ATENCION').length;
        const vencidos = productosConAlertas.filter(p => p.nivelAlerta === 'VENCIDO').length;
        const valorTotal = productos.reduce((sum, p) => sum + (p.cantidad * p.precio_venta), 0);
        const totalProductos = productos.reduce((sum, p) => sum + p.cantidad, 0);

        return { criticos, atencion, vencidos, valorTotal, totalProductos };
    }, [productosConAlertas, productos]);




    // ============================================
    // RENDERIZADO PRINCIPAL
    // ============================================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Cargando datos...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
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

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-emerald-600 text-white shadow-lg">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Tienda La Fortaleza</h1>
                            <p className="text-emerald-100 text-sm">Sistema de Gestión de Inventario</p>
                        </div>
                        <button
                            onClick={loadData}
                            className="bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-md text-sm flex items-center gap-2"
                        >
                            <Icon name="RefreshCw" size={16} />
                            Actualizar
                        </button>
                    </div>
                </div>
            </header>

            {/* Navegación */}
            <nav className="bg-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex gap-1">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
                            { id: 'inventario', label: 'Inventario', icon: 'Package' },
                            { id: 'alertas', label: 'Alertas', icon: 'Bell' },
                            { id: 'movimientos', label: 'Movimientos', icon: 'ArrowLeftRight' },
                            { id: 'reportes', label: 'Reportes', icon: 'BarChart3' }
                        ].map(nav => (
                            <button
                                key={nav.id}
                                onClick={() => setCurrentView(nav.id)}
                                className={`px-6 py-4 font-medium transition-colors flex items-center gap-2 ${
                                    currentView === nav.id
                                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                                        : 'text-gray-600 hover:text-emerald-600'
                                }`}
                            >
                                <Icon name={nav.icon} size={18} />
                                {nav.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Contenido Principal */}
            <main className="container mx-auto px-4 py-8">
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
                        productosFiltrados={productosFiltrados}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterCategory={filterCategory}
                        setFilterCategory={setFilterCategory}
                        setShowForm={setShowForm}
                        setEditingProduct={setEditingProduct}
                        registrarMovimiento={registrarMovimiento}
                        deleteProduct={deleteProduct}
                        formatDate={formatDate}
                        formatCurrency={formatCurrency}
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
                        formatCurrency={formatCurrency}
                    />
                )}
            </main>

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

            {/* Footer */}
            <footer className="bg-white border-t mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
                    © 2026 Tienda La Fortaleza - Sistema de Inventario
                </div>
            </footer>
        </div>
    );
}

// Renderizar la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


/*const utils = {
    formatCurrency,
    formatDate,
    calculateDaysUntilExpiry,
    getAlertLevel,
    getAlertColor
}*/