import Router from "express";
import * as auditController from "../controllers/audit.controller.js";
import { authorizePermission } from "../middlewares/permissions.middleware.js";



const router = Router();

router.get("/", auditController.listAudits);

export default router;
