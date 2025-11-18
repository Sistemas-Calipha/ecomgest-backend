import { registerAudit } from "../services/audit.service.js";

/**
 * Extrae IP y User-Agent de la request.
 * Lo dejamos en una función reutilizable porque lo vas a usar
 * tanto en controllers como en el middleware global.
 */
export function getRequestMeta(req) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.ip ||
    req.connection?.remoteAddress ||
    null;

  const userAgent = req.headers["user-agent"] || null;

  return { ip, userAgent };
}

/**
 * Middleware global de auditoría (opcional por ahora).
 * Si lo activas en app.js, registrará automáticamente cada request.
 */
export function auditMiddleware(req, res, next) {
  const { ip, userAgent } = getRequestMeta(req);
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    registerAudit({
      userId: req.user?.id || null,          // cuando uses auth.middleware.js
      action: `${req.method} ${req.originalUrl}`,
      details: {
        status: res.statusCode,
        duration_ms: duration,
      },
      ip,
      userAgent,
    });
  });

  next();
}
