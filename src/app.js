// src/app.js

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import rolesRoutes from "./routes/roles.routes.js";
import permissionsRoutes from "./routes/permissions.routes.js";
import rolePermissionsRoutes from "./routes/rolePermissions.routes.js";
import auditRoutes from "./routes/audit.routes.js";

const app = express();

// Middlewares esenciales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Rutas
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/roles", rolesRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/role-permissions", rolePermissionsRoutes);
app.use("/audit", auditRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("ECOMGEST Backend API is running 🚀");
});

export default app;
