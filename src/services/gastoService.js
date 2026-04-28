import { supabaseClient } from "./supabaseClient.js";

export const gastoService = {
    async create(gasto) {
        return await supabaseClient.from('gastos_caja').insert([gasto]);
    },
    async getHoy() {
        const inicio = new Date();
        inicio.setHours(0, 0, 0, 0);
        return await supabaseClient
            .from('gastos_caja')
            .select('*')
            .gte('fecha_hora', inicio.toISOString())
            .order('fecha_hora', { ascending: false });
    },
};
