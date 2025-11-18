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

