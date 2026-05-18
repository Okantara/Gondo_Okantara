import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 👇 INI YANG KAMU TAMBAH (DEBUG)
console.log("URL:", supabaseUrl);
console.log("KEY:", supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);