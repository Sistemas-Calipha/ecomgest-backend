// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  console.log("🟡 Authorization recibido:", req.headers["authorization"]);

  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensaje: "Token faltante" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ Token inválido o expirado:", err.message);
      return res.status(403).json({ mensaje: "Token inválido o expirado" });
    }

    req.user = decoded;
    next();
  });
}
