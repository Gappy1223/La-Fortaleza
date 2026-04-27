import React, { useState } from 'react';
import Icon from './Icon';

export default function StockInForm({product, onSave, onCancel}){
    const [formData, setFormData] = useState({
        cantidadSuma: 1,
        nuevaCaducidad: product?.fecha_caducidad || '',
        nuevoCosto: product?.precio_compra || 0,
        notas: ''
    });

    const handleSubmit = (e)=>{
        e.preventDefault();
        if(formData.cantidadSuma <= 0){
            return alert("La cantidad debe ser mayor a cero.");
        }
        onSave(formData);
    };

    return(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Icon name="PlusCircle" size={20} />
                        Reabastecer: {product?.nombre}
                    </h3>
                    <button onClick={onCancel} className="hover:bg-emerald-700 p-1 rounded">
                        <Icon name="X" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad a añadir</label>
                        <input
                            type="number" required min="1"
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.cantidadSuma}
                            onChange={e => setFormData({...formData, cantidadSuma: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Costo (u)</label>
                            <input
                                type="number" step="0.01" required
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
                                value={formData.nuevoCosto}
                                onChange={e => setFormData({...formData, nuevoCosto: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Caducidad</label>
                            <input
                                type="date" required
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500"
                                value={formData.nuevaCaducidad}
                                onChange={e => setFormData({...formData, nuevaCaducidad: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas de recepción</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 h-20 resize-none"
                            placeholder="Ej: Compra semanal, llegó en buen estado..."
                            value={formData.notas}
                            onChange={e => setFormData({...formData, notas: e.target.value})}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-bold">
                            Confirmar Entrada
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}