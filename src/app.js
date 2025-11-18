import authRoutes from "./routes/auth.routes.js";

app.use("/auth", authRoutes);

import usersRoutes from "./routes/users.routes.js";
app.use("/users", usersRoutes);

import rolesRoutes from "./routes/roles.routes.js";
app.use("/roles", rolesRoutes);

import permissionsRoutes from "./routes/permissions.routes.js";
app.use("/permissions", permissionsRoutes);

import rolePermissionsRoutes from "./routes/rolePermissions.routes.js";
app.use("/role-permissions", rolePermissionsRoutes);

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import rolesRoutes from "./routes/roles.routes.js";
import permissionsRoutes from "./routes/permissions.routes.js";
import rolePermissionsRoutes from "./routes/rolePermissions.routes.js";
import auditRoutes from "./routes/audit.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas principales
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/roles", rolesRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/role-permissions", rolePermissionsRoutes);
app.use("/audit", auditRoutes);

// ⭐ Ruta raíz amigable
app.get("/", (req, res) => {
  res.send("ECOMGEST Backend API is running 🚀");
});

export default app;
