import React, { useEffect } from "react";

const { useState } = React;

export default function ProductForm({ product, onSave, onCancel }){
        const [formData, setFormData] = useState(product || {
            id: `PROD-${Date.now()}`,
            nombre: '',
            categoria: 'LACTEOS',
            cantidad: 0,
            fecha_entrada: new Date().toISOString().split('T')[0],
            fecha_caducidad: '',
            precio_compra: 0,
            precio_venta: 0,
            proveedor: '',
            codigo_barras: '',
            nivel_minimo: 5,
            ubicacion: ''
        });
        
        const [margenGanancia, setMargenGanancia] = useState(15);
        
        useEffect(() => {
            if (product){
                setFormData({
                    ...product,
                    precio_compra: product.precio_compra || '',
                    precio_venta: product.precio_venta || '',
                    fecha_caducidad: product.fecha_caducidad ? product.fecha_caducidad.split('T')[0] : ''
                });

                if(product.precio_compra && product.precio_venta){
                    const ganancia = ((product.precio_venta - product.precio_compra) / product.precio_compra) * 100;
                    setMargenGanancia(Math.round(ganancia));
                }
            }
        }, [product]);


        const handleSubmit = (e) => {
            e.preventDefault();
            
            if (!formData.nombre || !formData.fecha_caducidad) {
                alert('Por favor completa los campos obligatorios');
                return;
            }

            if (new Date(formData.fecha_caducidad) < new Date(formData.fecha_entrada)) {
                alert('La fecha de caducidad no puede ser anterior a la fecha de entrada');
                return;
            }

            onSave(formData);
        };

        const costoNumerico = Number(formData.precio_compra) || 0;
        const precioSugerido = costoNumerico > 0 ? costoNumerico * (1 + (margenGanancia / 100)) : 0;
        const aplicarPrecioSugerido = () => {
        setFormData(prev => ({
            ...prev,
            precio_venta: precioSugerido.toFixed(2) // Lo redondeamos a 2 decimales para dinero
            }));
        };

return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Icon name="PackagePlus" size={24} className="text-emerald-600" />
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onCancel} className="text-gray-500 hover:bg-gray-200 p-1 rounded-md transition-colors">
                        <Icon name="X" size={24} />
                    </button>
                </div>

                {/* Contenido Formulario */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                    type="text" required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.categoria}
                                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                                >
                                    <option value="ABARROTES">Abarrotes</option>
                                    <option value="LACTEOS">Lácteos y Refrigerados</option>
                                    <option value="BEBIDAS">Bebidas</option>
                                    <option value="BOTANAS">Botanas y Dulces</option>
                                    <option value="LIMPIEZA">Limpieza del Hogar</option>
                                    <option value="HIGIENE">Higiene Personal</option>
                                    <option value="PANADERIA">Panadería</option>
                                    <option value="OTROS">Otros</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.codigo_barras}
                                    onChange={e => setFormData({ ...formData, codigo_barras: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Caducidad</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.fecha_caducidad}
                                    onChange={e => setFormData({ ...formData, fecha_caducidad: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* NUEVA SECCIÓN: PRECIOS Y MARGEN */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Icon name="TrendingUp" size={16} />
                                Precios y Ganancia
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Compra *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number" step="0.01" required
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={formData.precio_compra}
                                            onChange={e => setFormData({ ...formData, precio_compra: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Margen (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            value={margenGanancia}
                                            onChange={e => setMargenGanancia(Number(e.target.value))}
                                        />
                                        <span className="absolute right-3 top-2 text-gray-500">%</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="number" step="0.01" required
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                            value={formData.precio_venta}
                                            onChange={e => setFormData({ ...formData, precio_venta: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Alerta de Sugerencia */}
                            {costoNumerico > 0 && (
                                <div className="mt-4 flex items-center justify-between bg-emerald-50 p-3 rounded border border-emerald-100">
                                    <span className="text-sm text-gray-600">
                                        Sugerido al {margenGanancia}%: <strong className="text-emerald-700">${precioSugerido.toFixed(2)}</strong>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={aplicarPrecioSugerido}
                                        className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 transition-colors shadow-sm font-medium"
                                    >
                                        Aplicar Precio
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Inicial *</label>
                                <input
                                    type="number" required
                                    disabled={!!product} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                                    value={formData.cantidad}
                                    onChange={e => setFormData({ ...formData, cantidad: e.target.value })}
                                />
                                {!!product && <p className="text-xs text-gray-500 mt-1">Modificar mediante movimientos.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alerta Stock Mínimo *</label>
                                <input
                                    type="number" required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={formData.nivel_minimo}
                                    onChange={e => setFormData({ ...formData, nivel_minimo: e.target.value })}
                                />
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="productForm"
                        className="px-4 py-2 bg-emerald-600 rounded-md text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                        <Icon name="Save" size={16} />
                        Guardar Producto
                    </button>
                </div>
            </div>
        </div>
    );
}