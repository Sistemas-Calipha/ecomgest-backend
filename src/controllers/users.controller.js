import {
  listUsers,
  createUser,
  getUser,
  updateUser,
  updateUserState,
  resetPassword,
} from "../services/users.service.js";

export async function listUsersController(req, res) {
  const result = await listUsers(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  res.status(result.status).json(result.data);
}

export async function createUserController(req, res) {
  const result = await createUser(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  res.status(result.status).json(result.data);
}

export async function getUserController(req, res) {
  const result = await getUser(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  res.status(result.status).json(result.data);
}

export async function updateUserController(req, res) {
  const result = await updateUser(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  res.status(result.status).json(result.data);
}

export async function updateUserStateController(req, res) {
  const result = await updateUserState(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  res.status(result.status).json(result.data);
}

export async function resetPasswordController(req, res) {
  const result = await resetPassword(req);
  if (result.error) return res.status(result.status).json({ mensaje: result.error });
  res.status(result.status).json(result.data);
}
