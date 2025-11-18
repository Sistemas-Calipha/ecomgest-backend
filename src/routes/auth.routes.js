import Router from "express";
import { authorizePermission } from "../middlewares/permissions.middleware.js";



import {
  loginController,
  registerController,
  demoController,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/demo", demoController);

export default router;
