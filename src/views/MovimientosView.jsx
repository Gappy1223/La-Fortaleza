export default function MovimientosView({
    movimientos,
    formatCurrency
}) {
    return (
        <div>
            {movimientos.map(m => (
                <div key={m.id}>
                    <p>{m.producto_nombre}</p>
                    <p>{m.tipo}</p>
                    <p>{formatCurrency(m.valor_total)}</p>
                </div>
            ))}
        </div>
    );
}