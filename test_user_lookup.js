import supabase from "./src/config/supabase.js";

const run = async () => {
  console.log("🔍 Listando usuarios de la tabla 'usuarios'...");

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, correo, contrasena");

  console.log("➡️ DATA:", data);
  console.log("➡️ ERROR:", error);
};

run();
