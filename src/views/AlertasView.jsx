export default function AlertasView({
    productosConAlertas,
    registrarMovimiento,
    formatDate
}) {
    const criticos = productosConAlertas.filter(p =>
        p.nivelAlerta === 'CRITICO' || p.nivelAlerta === 'VENCIDO'
    );

    return (
        <div>
            {criticos.map(producto => (
                <div key={producto.id}>
                    <p>{producto.nombre}</p>
                    <p>{formatDate(producto.fecha_caducidad)}</p>

                    <button onClick={() =>
                        registrarMovimiento('MERMA', producto, producto.cantidad)
                    }>
                        Dar de baja
                    </button>
                </div>
            ))}
        </div>
    );
}