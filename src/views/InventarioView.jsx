import { useState } from "react";
import Icon from "../components/Icon";
export default function InventarioView({
    productos,
    formatCurrency,
    setEditingProduct, 
    setShowForm,
    deleteProduct
}) {
    const [busqueda, setBusqueda] = useState('');
    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria.toLowerCase().includes(busqueda.toLowerCase())
    );
    const handleNuevoProducto = () => {
        setEditingProduct(null);
        setShowForm(true);
    };
return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            
            {/* 1. HEADER DE LA TABLA (Buscador y Botón Nuevo) */}
            <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o categoría..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleNuevoProducto}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
                >
                    <Icon name="Plus" size={18} />
                    Nuevo Producto
                </button>
            </div>

            {/* 2. CONTENEDOR DE LA TABLA */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Producto</th>
                            <th className="px-6 py-4 font-semibold">Categoría</th>
                            <th className="px-6 py-4 font-semibold text-right">Stock</th>
                            <th className="px-6 py-4 font-semibold text-right">Precio Unitario</th>
                            <th className="px-6 py-4 font-semibold text-center">Estado</th>
                            <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {productosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Icon name="SearchX" size={48} className="text-gray-300 mb-4" />
                                        <p className="text-lg font-medium text-gray-600">No se encontraron productos</p>
                                        <p className="text-sm mt-1">Intenta con otro término de búsqueda o agrega uno nuevo.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            productosFiltrados.map((producto) => {
                                // Determinamos si el producto tiene stock bajo
                                const esStockBajo = producto.cantidad <= producto.nivel_minimo;
                                
                                return (
                                    <tr key={producto.id} className="hover:bg-emerald-50/30 transition-colors group">
                                        
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{producto.nombre}</div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md border border-gray-200 text-xs font-medium">
                                                {producto.categoria}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-right">
                                            <div className={`font-semibold ${esStockBajo ? 'text-red-600' : 'text-gray-800'}`}>
                                                {producto.cantidad}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">Min: {producto.nivel_minimo}</div>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-right font-medium text-gray-700">
                                            {formatCurrency ? formatCurrency(producto.precio_venta || 0) : `$${(producto.precio_venta || 0).toFixed(2)}`}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-center">
                                            {esStockBajo ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                                    Stock Bajo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Óptimo
                                                </span>
                                            )}
                                        </td>
                                        
                                        {/* Botones de acción (visibles al hacer hover) */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingProduct(producto);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 hover:shadow-sm rounded-lg transition-all"
                                                    title="Editar producto"
                                                >
                                                    <Icon name="Edit2" size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if(window.confirm(`¿Seguro que deseas eliminar ${producto.nombre}?`)) {
                                                            deleteProduct && deleteProduct(producto.id);
                                                        }
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-100 hover:shadow-sm rounded-lg transition-all"
                                                    title="Eliminar producto"
                                                >
                                                    <Icon name="Trash2" size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}