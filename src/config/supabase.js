// src/config/supabase.js
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Asegura que .env se cargue ANTES DE TODO
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ ERROR: Variables de entorno de Supabase no cargadas.");
  console.error("SUPABASE_URL:", SUPABASE_URL);
  console.error("SUPABASE_KEY:", SUPABASE_KEY);
  throw new Error("Supabase config missing env vars.");
}

console.log("🔵 Supabase config cargado correctamente.");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
