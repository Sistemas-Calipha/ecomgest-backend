import supabase from "../config/supabase.js";

/**
 * Listar permisos asignados a un rol
 */
export async function listRolePermissions(req) {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("roles_permisos")
      .select("id, permiso_id, permisos(nombre, descripcion, modulo, accion, activo)")
      .eq("rol_id", id);

    if (error) return { status: 500, error: "Error obteniendo permisos del rol." };

    return { status: 200, data: { permissions_assigned: data } };
  } catch (err) {
    return { status: 500, error: "Error interno del servidor." };
  }
}

/**
 * Asignar uno o varios permisos al rol
 */
export async function assignPermissions(req) {
  const { id } = req.params;
  const { permissions } = req.body;

  if (!Array.isArray(permissions) || permissions.length === 0) {
    return { status: 400, error: "Debes enviar un array de IDs de permisos." };
  }

  try {
    const inserts = permissions.map((pid) => ({
      rol_id: id,
      permiso_id: pid,
      activo: true,
    }));

    const { data, error } = await supabase
      .from("roles_permisos")
      .insert(inserts)
      .select();

    if (error) return { status: 500, error: "Error asignando permisos al rol." };

    return {
      status: 201,
      data: {
        message: "Permisos asignados correctamente.",
        assigned: data,
      },
    };
  } catch (err) {
    return { status: 500, error: "Error interno del servidor." };
  }
}

/**
 * Quitar un permiso del rol
 */
export async function removePermission(req) {
  const { id, permissionId } = req.params;

  try {
    const { data, error } = await supabase
      .from("roles_permisos")
      .delete()
      .eq("rol_id", id)
      .eq("permiso_id", permissionId)
      .select();

    if (error) return { status: 500, error: "Error eliminando permiso del rol." };

    return {
      status: 200,
      data: {
        message: "Permiso eliminado correctamente del rol.",
        removed: data,
      },
    };
  } catch (err) {
    return { status: 500, error: "Error interno del servidor." };
  }
}
