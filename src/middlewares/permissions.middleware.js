import supabase from "../config/supabase.js";

/**
 * Middleware que valida si el rol del usuario tiene un permiso específico
 * @param {string} permissionName - Nombre del permiso requerido
 */
export function authorizePermission(permissionName) {
  return async (req, res, next) => {
    try {
      const roleId = req.user?.rol_id || req.usuario?.rol_id;

      if (!roleId) {
        return res.status(401).json({ message: "User role not found in token." });
      }

      // Buscar permiso por nombre
      const { data: permission, error: errorPerm } = await supabase
        .from("permisos")
        .select("id")
        .eq("nombre", permissionName)
        .eq("activo", true)
        .single();

      if (errorPerm || !permission) {
        return res.status(403).json({ message: "Permission does not exist or is inactive." });
      }

      // Verificar si el rol tiene asignado ese permiso
      const { data: assigned, error: errorAssigned } = await supabase
        .from("roles_permisos")
        .select("id")
        .eq("rol_id", roleId)
        .eq("permiso_id", permission.id)
        .limit(1);

      if (errorAssigned) {
        throw errorAssigned;
      }

      if (!assigned || assigned.length === 0) {
        return res.status(403).json({ message: "You do not have this permission." });
      }

      next();
    } catch (err) {
      console.error("❌ Error in authorizePermission middleware:", err);
      res.status(500).json({ message: "Internal server error in permission validation." });
    }
  };
}
