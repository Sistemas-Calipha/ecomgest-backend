import jwt from "jsonwebtoken";

/**
 * Middleware que verifica el token JWT
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token not provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ Invalid or expired token:", err);
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    req.user = decoded; // estandarizado para todas las rutas
    next();
  });
}
