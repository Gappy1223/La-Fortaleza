import React from "react";

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

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            {product ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre del Producto *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Categoría *
                                    </label>
                                    <select
                                        required
                                        value={formData.categoria}
                                        onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        <option value="LACTEOS">Lácteos</option>
                                        <option value="ABARROTES">Abarrotes</option>
                                        <option value="CARNES_FRIAS">Carnes Frías</option>
                                        <option value="BEBIDAS">Bebidas</option>
                                        <option value="LIMPIEZA">Limpieza</option>
                                        <option value="ASEO_PERSONAL">Aseo Personal</option>
                                        <option value="OTROS">Otros</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cantidad *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.cantidad || ''}
                                        onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Entrada *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fecha_entrada}
                                        onChange={(e) => setFormData({...formData, fecha_entrada: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de Caducidad *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fecha_caducidad}
                                        onChange={(e) => setFormData({...formData, fecha_caducidad: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Precio de Compra
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.precio_compra}
                                        onChange={(e) => setFormData({...formData, precio_compra: parseFloat(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Precio de Venta
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.precio_venta}
                                        onChange={(e) => setFormData({...formData, precio_venta: parseFloat(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Proveedor
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.proveedor}
                                        onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Código de Barras
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.codigo_barras}
                                        onChange={(e) => setFormData({...formData, codigo_barras: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nivel Mínimo de Stock
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.nivel_minimo}
                                        onChange={(e) => setFormData({...formData, nivel_minimo: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ubicación
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.ubicacion}
                                        onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                                        placeholder="Ej: Refrigerador 1, Anaquel A"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 font-medium"
                                >
                                    {product ? 'Actualizar' : 'Guardar'} Producto
                                </button>
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };