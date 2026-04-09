import { supabaseClient } from './supabaseClient.js';

export const productService = {
    async getAll(){
        return await supabaseClient
            .from('productos')
            .select('*')
            .order("created_at", {ascending: false});
    },
    async create(product){
        return await supabaseClient.from("productos").insert([product]);   
    },
    async update(id, product){
        return await supabaseClient
            .from('productos')
            .update({
                ...product,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);
    },
    async delete(id){
        return await supabaseClient.from("productos").delete().eq('id', id);
    }
};