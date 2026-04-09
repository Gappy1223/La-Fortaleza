import { supabaseClient } from "./supabaseClient.js";

export const movementService = {
    async getAll(){
        return await supabaseClient
            .from('movimientos')
            .select('*')
            .order("fecha_hora", {ascending: false})
            .limit(100);
    },
    async create(movimiento){
        return await supabaseClient.from("movimientos").insert([movimiento]);
    }
};