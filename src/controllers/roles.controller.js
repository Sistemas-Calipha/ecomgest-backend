import {
  listRoles,
  createRole,
  updateRole,
  updateRoleState,
} from "../services/roles.service.js";

export async function listRolesController(req, res) {
  const result = await listRoles(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  return res.status(result.status).json(result.data);
}

export async function createRoleController(req, res) {
  const result = await createRole(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  return res.status(result.status).json(result.data);
}

export async function updateRoleController(req, res) {
  const result = await updateRole(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  return res.status(result.status).json(result.data);
}

export async function updateRoleStateController(req, res) {
  const result = await updateRoleState(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  return res.status(result.status).json(result.data);
}
