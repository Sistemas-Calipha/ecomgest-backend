import Router from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";

import { authorizePermission } from "../middlewares/permissions.middleware.js";



import {
  listRolesController,
  createRoleController,
  updateRoleController,
  updateRoleStateController,
} from "../controllers/roles.controller.js";

const router = Router();

// ver_roles
router.get("/", verifyToken, authorizePermission("ver_roles"), listRolesController);

// crear_rol
router.post("/", verifyToken, authorizePermission("crear_rol"), createRoleController);

// editar_rol
router.put("/:id", verifyToken, authorizePermission("editar_rol"), updateRoleController);

// activar_rol
router.patch("/:id/state", verifyToken, authorizePermission("activar_rol"), updateRoleStateController);

export default router;
