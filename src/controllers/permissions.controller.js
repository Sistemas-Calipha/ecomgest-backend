import {
  listPermissions,
  createPermission,
  updatePermission,
  updatePermissionState,
} from "../services/permissions.service.js";

export async function listPermissionsController(req, res) {
  const result = await listPermissions(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  return res.status(result.status).json(result.data);
}

export async function createPermissionController(req, res) {
  const result = await createPermission(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  return res.status(result.status).json(result.data);
}

export async function updatePermissionController(req, res) {
  const result = await updatePermission(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  return res.status(result.status).json(result.data);
}

export async function updatePermissionStateController(req, res) {
  const result = await updatePermissionState(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  return res.status(result.status).json(result.data);
}
