// src/routes/auth.routes.js
import { Router } from "express";
import {
  loginController,
  registerController,
  demoController,
  generarHashTest,
  testTokenController
} from "../controllers/auth.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/demo", demoController);

router.get("/test-token", verifyToken, testTokenController);

router.get("/test/hash", generarHashTest);

export default router;
