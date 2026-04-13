import { supabaseClient } from "./supabaseClient";

export const corteService = {
    async registrarCorte(datosCorte){
        try{
            const { data, error } = await supabaseClient
                .from('cortes_caja')
                .insert([
                    {
                        usuario: datosCorte.usuario || 'Administrador',
                        monto_apertura: datosCorte.montoApertura,
                        ventas_totales: datosCorte.ventasTotales,
                        monto_cierre: datosCorte.montoCierre,
                        diferencia: datosCorte.diferencia,
                        notas: datosCorte.notas || 'Cierre regular'
                    }
                ]);

            if(error){
                throw error;
            }
            return data;
        } catch (error){
            console.error("Error al registrar corte de caja:", error);
            throw error;
        }
    },

    async obtenerHistorialCortes(){
        try {
            const { data, error } = await supabaseClient
                .from('cortes_caja')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo cortes:', error);
            return [];
        }
    }
}