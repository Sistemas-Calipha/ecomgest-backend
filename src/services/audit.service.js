import supabase from "../config/supabase.js";

/**
 * Registra un evento en la tabla "auditoria".
 * Nombres en inglés en el código, pero respeta las columnas en español de la base:
 *  - usuario_id
 *  - accion
 *  - detalle
 *  - ip
 *  - user_agent
 */
export async function registerAudit({
  userId = null,
  action,
  details = {},
  ip = null,
  userAgent = null,
}) {
  try {
    const payload = {
      usuario_id: userId,
      accion: action,
      detalle: details,
      ip,
      user_agent: userAgent,
    };

    const { error } = await supabase.from("auditoria").insert(payload);

    if (error) {
      console.error("❌ Error saving audit log:", error);
    }
  } catch (err) {
    console.error("❌ Exception saving audit log:", err.message);
  }
}

export async function getAllAudits() {
  const { data, error } = await supabase
    .from("auditoria")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
