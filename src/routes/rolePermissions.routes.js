import Router from "express";
import * as rolePermissionsController from "../controllers/rolePermissions.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

import { authorizePermission } from "../middlewares/permissions.middleware.js";


const router = Router();

/**
 * GET - List permissions assigned to a role
 * Requires: ver_roles
 */
router.get(
  "/:roleId",
  verifyToken,
  authorizePermission("ver_roles"),
  rolePermissionsController.getRolePermissions
);

/**
 * POST - Assign one or many permissions to a role
 * Requires: editar_rol
 */
router.post(
  "/:roleId",
  verifyToken,
  authorizePermission("editar_rol"),
  rolePermissionsController.assignPermissionsToRole
);

/**
 * DELETE - Remove a permission from a role
 * Requires: editar_rol
 */
router.delete(
  "/:roleId/:permissionId",
  verifyToken,
  authorizePermission("editar_rol"),
  rolePermissionsController.removePermissionFromRole
);

export default router;
