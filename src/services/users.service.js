import supabase from "../config/supabase.js";
import bcrypt from "bcrypt";
import { registerAudit } from "./audit.service.js";
import { getRequestMeta } from "../middlewares/audit.middleware.js";

/**
 * Obtener lista de usuarios
 */
export async function listUsers(req) {
  const { ip, userAgent } = getRequestMeta(req);

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre_completo, correo, rol_id, activo, creado_en")
    .order("creado_en", { ascending: false });

  if (error) {
    await registerAudit({
      userId: req.user.id,
      action: "USERS_LIST_ERROR",
      details: { error: error.message },
      ip,
      userAgent,
    });

    return { status: 500, error: "Error al obtener usuarios." };
  }

  await registerAudit({
    userId: req.user.id,
    action: "USERS_LIST_OK",
    details: { count: data.length },
    ip,
    userAgent,
  });

  return { status: 200, data: { users: data } };
}

/**
 * Crear usuario nuevo
 */
export async function createUser(req) {
  const { nombre_completo, correo, contrasena, rol_id, activo = true } = req.body;
  const { ip, userAgent } = getRequestMeta(req);

  if (!nombre_completo || !correo || !rol_id) {
    return { status: 400, error: "Nombre, correo y rol son obligatorios." };
  }

  const { data: exists } = await supabase
    .from("usuarios")
    .select("id")
    .eq("correo", correo)
    .limit(1);

  if (exists && exists.length > 0) {
    return { status: 409, error: "El correo ya está registrado." };
  }

  const finalPassword = contrasena || Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(finalPassword, 10);

  const { data, error } = await supabase
    .from("usuarios")
    .insert([
      {
        nombre_completo,
        correo,
        contrasena: hashed,
        rol_id,
        activo,
      },
    ])
    .select();

  if (error) {
    return { status: 500, error: "Error interno del servidor." };
  }

  await registerAudit({
    userId: req.user.id,
    action: "USER_CREATED",
    details: {
      new_user_id: data[0].id,
      correo: data[0].correo,
      rol_id,
    },
    ip,
    userAgent,
  });

  return {
    status: 201,
    data: {
      message: "Usuario creado exitosamente.",
      user: {
        id: data[0].id,
        nombre_completo: data[0].nombre_completo,
        correo: data[0].correo,
        rol_id: data[0].rol_id,
        activo: data[0].activo,
      },
      generated_password: contrasena ? null : finalPassword,
    },
  };
}

/**
 * Detalle de un usuario
 */
export async function getUser(req) {
  const { id } = req.params;
  const { ip, userAgent } = getRequestMeta(req);

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre_completo, correo, rol_id, activo, creado_en")
    .eq("id", id)
    .single();

  if (error || !data) {
    await registerAudit({
      userId: req.user.id,
      action: "USER_NOT_FOUND",
      details: { id },
      ip,
      userAgent,
    });

    return { status: 404, error: "Usuario no encontrado." };
  }

  await registerAudit({
    userId: req.user.id,
    action: "USER_DETAIL_OK",
    details: { id },
    ip,
    userAgent,
  });

  return { status: 200, data: { user: data } };
}

/**
 * Actualizar usuario
 */
export async function updateUser(req) {
  const { id } = req.params;
  const { nombre_completo, correo, rol_id, activo } = req.body;
  const { ip, userAgent } = getRequestMeta(req);

  const fields = {};
  if (nombre_completo !== undefined) fields.nombre_completo = nombre_completo;
  if (correo !== undefined) fields.correo = correo;
  if (rol_id !== undefined) fields.rol_id = rol_id;
  if (activo !== undefined) fields.activo = activo;

  if (Object.keys(fields).length === 0) {
    return { status: 400, error: "No hay campos para actualizar." };
  }

  const { data, error } = await supabase
    .from("usuarios")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { status: 500, error: "Error interno del servidor." };
  }

  await registerAudit({
    userId: req.user.id,
    action: "USER_UPDATED",
    details: { id, changes: fields },
    ip,
    userAgent,
  });

  return {
    status: 200,
    data: {
      message: "Usuario actualizado correctamente.",
      user: {
        id: data.id,
        nombre_completo: data.nombre_completo,
        correo: data.correo,
        rol_id: data.rol_id,
        activo: data.activo,
      },
    },
  };
}

/**
 * Cambiar estado (activar / desactivar)
 */
export async function updateUserState(req) {
  const { id } = req.params;
  const { activo } = req.body;
  const { ip, userAgent } = getRequestMeta(req);

  if (activo === undefined) {
    return { status: 400, error: "Debe indicar el estado 'activo'." };
  }

  const { data, error } = await supabase
    .from("usuarios")
    .update({ activo })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { status: 500, error: "Error interno del servidor." };
  }

  await registerAudit({
    userId: req.user.id,
    action: "USER_STATE_CHANGED",
    details: { id, active: activo },
    ip,
    userAgent,
  });

  return {
    status: 200,
    data: {
      message: `Usuario ${activo ? "activado" : "desactivado"} correctamente.`,
      user: {
        id: data.id,
        nombre_completo: data.nombre_completo,
        correo: data.correo,
        rol_id: data.rol_id,
        activo: data.activo,
      },
    },
  };
}

/**
 * Resetear contraseña
 */
export async function resetPassword(req) {
  const { id } = req.params;
  const { ip, userAgent } = getRequestMeta(req);

  const newPassword = Math.random().toString(36).slice(-10);
  const hashed = await bcrypt.hash(newPassword, 10);

  const { data, error } = await supabase
    .from("usuarios")
    .update({ contrasena: hashed })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { status: 500, error: "Error interno del servidor." };
  }

  await registerAudit({
    userId: req.user.id,
    action: "USER_PASSWORD_RESET",
    details: { id },
    ip,
    userAgent,
  });

  return {
    status: 200,
    data: {
      message: "Contraseña reseteada correctamente.",
      user: {
        id: data.id,
        nombre_completo: data.nombre_completo,
        correo: data.correo,
        rol_id: data.rol_id,
        activo: data.activo,
      },
      new_password: newPassword,
    },
  };
}
