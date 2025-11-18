import Router from "express";

import { verifyToken } from "../middlewares/auth.middleware.js";

import { authorizePermission } from "../middlewares/permissions.middleware.js";



import {
  listPermissionsController,
  createPermissionController,
  updatePermissionController,
  updatePermissionStateController,
} from "../controllers/permissions.controller.js";

const router = Router();

// ver_permisos
router.get("/", verifyToken, authorizePermission("ver_permisos"), listPermissionsController);

// crear_permiso
router.post("/", verifyToken, authorizePermission("crear_permiso"), createPermissionController);

// editar_permiso
router.put("/:id", verifyToken, authorizePermission("editar_permiso"), updatePermissionController);

// activar_permiso
router.patch("/:id/state", verifyToken, authorizePermission("activar_permiso"), updatePermissionStateController);

export default router;
