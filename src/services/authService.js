import { supabaseClient } from "./supabaseClient.js";

export const authService = {
    signIn: (email, password) =>
        supabaseClient.auth.signInWithPassword({ email, password }),
    signOut: () =>
        supabaseClient.auth.signOut(),
    getSession: () =>
        supabaseClient.auth.getSession(),
    onAuthStateChange: (callback) =>
        supabaseClient.auth.onAuthStateChange(callback),
};
