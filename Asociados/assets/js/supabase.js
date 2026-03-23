// ================= SUPABASE =================
const SUPABASE_URL = "https://fgaohnnujmdotdakkfef.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NVVRD6k9y8NHvQwL3SBS6A_r2yxsqwe";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// global
window.supabaseClient = supabaseClient;

console.log("✅ Supabase listo");