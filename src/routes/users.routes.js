import Router from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";

import { authorizePermission } from "../middlewares/permissions.middleware.js";


import {
  listUsersController,
  createUserController,
  getUserController,
  updateUserController,
  updateUserStateController,
  resetPasswordController,
} from "../controllers/users.controller.js";

const router = Router();

// Lista completa - permiso ver_usuarios
router.get("/", verifyToken, authorizePermission("ver_usuarios"), listUsersController);

// Crear usuario - permiso crear_usuario
router.post("/", verifyToken, authorizePermission("crear_usuario"), createUserController);

// Detalle usuario - permiso ver_usuarios
router.get("/:id", verifyToken, authorizePermission("ver_usuarios"), getUserController);

// Actualizar usuario - permiso editar_usuario
router.put("/:id", verifyToken, authorizePermission("editar_usuario"), updateUserController);

// Cambiar estado (activar/desactivar) - permiso desactivar_usuario
router.patch("/:id/state", verifyToken, authorizePermission("desactivar_usuario"), updateUserStateController);

// Reset password - permiso editar_usuario
router.post("/:id/reset-password", verifyToken, authorizePermission("editar_usuario"), resetPasswordController);

export default router;
