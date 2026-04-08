export default function InventarioView({
    productosFiltrados,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    setShowForm,
    setEditingProduct,
    registrarMovimiento,
    deleteProduct,
    formatDate,
    formatCurrency
}) {
    return (
        <div>
            <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
            />

            <button onClick={() => setShowForm(true)}>
                Nuevo Producto
            </button>

            {productosFiltrados.map(producto => (
                <div key={producto.id}>
                    <p>{producto.nombre}</p>
                    <p>{formatDate(producto.fecha_caducidad)}</p>

                    <button onClick={() => setEditingProduct(producto)}>
                        Editar
                    </button>

                    <button onClick={() => deleteProduct(producto.id)}>
                        Eliminar
                    </button>

                    <button onClick={() => {
                        const cantidad = prompt("Venta:");
                        if (cantidad) {
                            registrarMovimiento('SALIDA', producto, parseInt(cantidad));
                        }
                    }}>
                        Vender
                    </button>
                </div>
            ))}
        </div>
    );
}