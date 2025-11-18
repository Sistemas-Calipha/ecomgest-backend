import {
  listRolePermissions,
  assignPermissions,
  removePermission,
} from "../services/rolePermissions.service.js";

// GET /roles/:roleId
export async function getRolePermissions(req, res) {
  const result = await listRolePermissions(req);

  if (result.error) {
    return res.status(result.status).json({ mensaje: result.error });
  }

  return res.status(result.status).json(result.data);
}

// POST /roles/:roleId
export async function assignPermissionsToRole(req, res) {
  const result = await assignPermissions(req);

  if (result.error) {
    return res.status(result.status).json({ mensaje: result.error });
  }

  return res.status(result.status).json(result.data);
}

// DELETE /roles/:roleId/:permissionId
export async function removePermissionFromRole(req, res) {
  const result = await removePermission(req);

  if (result.error) {
    return res.status(result.status).json({ mensaje: result.error });
  }

  return res.status(result.status).json(result.data);
}
