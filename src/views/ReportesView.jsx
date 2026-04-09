export default function ReportesView({
    movimientos,
    estadisticas,
    formatCurrency
}) {
    const ventas = movimientos.filter(m => m.tipo === 'SALIDA');

    return (
        <div>
            <h2>Reportes</h2>

            <p>Ventas: {formatCurrency(
                ventas.reduce((sum, v) => sum + (v.valor_total || 0), 0)
            )}</p>

            <p>Inventario: {formatCurrency(estadisticas.valorTotal)}</p>
        </div>
    );
}