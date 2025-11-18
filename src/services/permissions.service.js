import supabase from "../config/supabase.js";

/**
 * Listar permisos
 */
export async function listPermissions(req) {
  try {
    const { data, error } = await supabase
      .from("permisos")
      .select("*")
      .order("id", { ascending: true });

    if (error) return { status: 500, error: "Error obteniendo permisos." };

    return { status: 200, data: { permissions: data } };
  } catch (err) {
    return { status: 500, error: "Error interno del servidor." };
  }
}

/**
 * Crear permiso
 */
export async function createPermission(req) {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return { status: 400, error: "El nombre del permiso es obligatorio." };
  }

  const key = nombre.toLowerCase();

  try {
    const { data: exists } = await supabase
      .from("permisos")
      .select("id")
      .eq("nombre", key)
      .limit(1);

    if (exists?.length > 0) {
      return { status: 409, error: "Ya existe un permiso con ese nombre." };
    }

    const { data, error } = await supabase
      .from("permisos")
      .insert([{ nombre: key, descripcion }])
      .select();

    if (error) return { status: 500, error: "Error interno del servidor." };

    return {
      status: 201,
      data: {
        message: "Permiso creado correctamente.",
        permission: data[0],
      },
    };
  } catch (err) {
    return { status: 500, error: "Error interno del servidor." };
  }
}

/**
 * Editar permiso
 */
export async function updatePermission(req) {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  const changes = {};
  if (nombre !== undefined) changes.nombre = nombre.toLowerCase();
  if (descripcion !== undefined) changes.descripcion = descripcion;

  if (Object.keys(changes).length === 0) {
    return { status: 400, error: "No hay cambios para actualizar." };
  }

  try {
    const { data, error } = await supabase
      .from("permisos")
      .update(changes)
      .eq("id", id)
      .select()
      .single();

    if (error) return { status: 500, error: "Error interno del servidor." };

    return {
      status: 200,
      data: {
        message: "Permiso actualizado correctamente.",
        permission: data,
      },
    };
  } catch (err) {
    return { status: 500, error: "Error interno del servidor." };
  }
}

/**
 * Activar / desactivar
 */
export async function updatePermissionState(req) {
  const { id } = req.params;
  const { activo } = req.body;

  if (activo === undefined) {
    return { status: 400, error: "Debe indicar el valor de 'activo'." };
  }

  try {
    const { data, error } = await supabase
      .from("permisos")
      .update({ activo })
      .eq("id", id)
      .select()
      .single();

    if (error) return { status: 500, error: "Error interno del servidor." };

    return {
      status: 200,
      data: {
        message: `Permiso ${activo ? "activado" : "desactivado"} correctamente.`,
        permission: data,
      },
    };
  } catch (err) {
    return { status: 500, error: "Error interno del servidor." };
  }
}
