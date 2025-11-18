import supabase from "../config/supabase.js";
import { registerAudit } from "./audit.service.js";
import { getRequestMeta } from "../middlewares/audit.middleware.js";

/**
 * Listar roles
 */
export async function listRoles(req) {
  try {
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return { status: 500, error: "Error obteniendo roles." };
    }

    return { status: 200, data: { roles: data } };
  } catch (err) {
    return { status: 500, error: "Error interno del servidor." };
  }
}

/**
 * Crear rol
 */
export async function createRole(req) {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return { status: 400, error: "El nombre del rol es obligatorio." };
  }

  const lower = nombre.toLowerCase();

  try {
    const { data: exists } = await supabase
      .from("roles")
      .select("id")
      .eq("nombre", lower)
      .limit(1);

    if (exists?.length > 0) {
      return { status: 409, error: "Ya existe un rol con ese nombre." };
    }

    const { data, error } = await supabase
      .from("roles")
      .insert([{ nombre: lower, descripcion }])
      .select();

    if (error) return { status: 500, error: "Error interno del servidor." };

    return {
      status: 201,
      data: {
        message: "Rol creado correctamente.",
        role: data[0],
      },
    };
  } catch (err) {
    return { status: 500, error: "Error interno del servidor." };
  }
}

/**
 * Actualizar rol
 */
export async function updateRole(req) {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  const updates = {};
  if (nombre !== undefined) updates.nombre = nombre.toLowerCase();
  if (descripcion !== undefined) updates.descripcion = descripcion;

  if (Object.keys(updates).length === 0) {
    return { status: 400, error: "No hay cambios para actualizar." };
  }

  try {
    const { data, error } = await supabase
      .from("roles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return { status: 500, error: "Error interno del servidor." };

    return {
      status: 200,
      data: {
        message: "Rol actualizado correctamente.",
        role: data,
      },
    };
  } catch (err) {
    return { status: 500, error: "Error interno del servidor." };
  }
}

/**
 * Activar / desactivar rol
 */
export async function updateRoleState(req) {
  const { id } = req.params;
  const { activo } = req.body;

  if (activo === undefined) {
    return { status: 400, error: "Debe indicar el valor de 'activo'." };
  }

  try {
    // Verificar si tiene usuarios asignados y evitar desactivación
    if (activo === false) {
      const { data: assigned } = await supabase
        .from("usuarios")
        .select("id")
        .eq("rol_id", id);

      if (assigned && assigned.length > 0) {
        return {
          status: 409,
          error: "No se puede desactivar este rol porque tiene usuarios asignados.",
        };
      }
    }

    const { data, error } = await supabase
      .from("roles")
      .update({ activo })
      .eq("id", id)
      .select()
      .single();

    if (error) return { status: 500, error: "Error interno del servidor." };

    return {
      status: 200,
      data: {
        message: `Rol ${activo ? "activado" : "desactivado"} correctamente.`,
        role: data,
      },
    };
  } catch (err) {
    return { status: 500, error: "Error interno del servidor." };
  }
}
