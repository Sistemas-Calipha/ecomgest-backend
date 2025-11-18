// src/app.js
// ==================================================
// CONFIGURACIÓN PRINCIPAL DEL SERVIDOR EXPRESS
// ==================================================

// -------------------------------
// IMPORTS
// -------------------------------
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Rutas API
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import rolesRoutes from "./routes/roles.routes.js";
import permissionsRoutes from "./routes/permissions.routes.js";
import rolePermissionsRoutes from "./routes/rolePermissions.routes.js";
import auditRoutes from "./routes/audit.routes.js";

// -------------------------------
// __dirname para ES Modules
// -------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------
// APP
// -------------------------------
const app = express();

// -------------------------------
// CORS (CORREGIDO Y OPTIMIZADO)
// -------------------------------
app.use(
  cors({
    origin: "*", // Puedes restringirlo más adelante
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -------------------------------
// BODY PARSERS
// -------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------
// FRONTEND ESTÁTICO (public/)
// -------------------------------
app.use(express.static(path.join(__dirname, "public")));

// -------------------------------
// RUTA PRINCIPAL → index.html
// -------------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -------------------------------
// RUTAS API
// -------------------------------
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/roles", rolesRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/role-permissions", rolePermissionsRoutes);
app.use("/audit", auditRoutes);

// -------------------------------
// EXPORT
// -------------------------------
export default app;
