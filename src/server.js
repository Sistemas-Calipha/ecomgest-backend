import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Importación de rutas
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import rolesRoutes from "./routes/roles.routes.js";
import permissionsRoutes from "./routes/permissions.routes.js";
import rolePermissionsRoutes from "./routes/rolePermissions.routes.js";
import auditRoutes from "./routes/audit.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Montar rutas
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/roles", rolesRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/role-permissions", rolePermissionsRoutes);
app.use("/audit", auditRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend operativo 🚀",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
