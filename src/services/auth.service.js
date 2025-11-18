import supabase from "../config/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerAudit } from "./audit.service.js";
import { getRequestMeta } from "../middlewares/audit.middleware.js";

export async function loginService(req) {
  const { correo, contrasena } = req.body;
  const { ip, userAgent } = getRequestMeta(req);

  if (!correo || !contrasena) {
    await registerAudit({
      userId: null,
      action: "LOGIN_MISSING_FIELDS",
      details: { correo_attempt: correo },
      ip,
      userAgent,
    });

    return { status: 400, error: "Faltan datos obligatorios." };
  }

  // Buscar usuario
  const { data: users } = await supabase
    .from("usuarios")
    .select("*")
    .eq("correo", correo)
    .limit(1);

  if (!users || users.length === 0) {
    await registerAudit({
      userId: null,
      action: "LOGIN_USER_NOT_FOUND",
      details: { correo_attempt: correo },
      ip,
      userAgent,
    });

    return { status: 401, error: "Credenciales inválidas." };
  }

  const user = users[0];

  const isValidPassword = await bcrypt.compare(contrasena, user.contrasena);

  if (!isValidPassword) {
    await registerAudit({
      userId: user.id,
      action: "LOGIN_INVALID_PASSWORD",
      details: { correo },
      ip,
      userAgent,
    });

    return { status: 401, error: "Credenciales inválidas." };
  }

  const token = jwt.sign(
    {
      id: user.id,
      correo: user.correo,
      rol_id: user.rol_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  await registerAudit({
    userId: user.id,
    action: "LOGIN_SUCCESS",
    details: { correo },
    ip,
    userAgent,
  });

  return {
    status: 200,
    data: {
      message: "Inicio de sesión exitoso.",
      user: {
        id: user.id,
        nombre_completo: user.nombre_completo,
        correo: user.correo,
        rol_id: user.rol_id,
        activo: user.activo,
      },
      token,
    },
  };
}

export async function registerService(req) {
  const { nombre_completo, correo, contrasena, rol_id = 4 } = req.body;

  if (!nombre_completo || !correo || !contrasena) {
    return { status: 400, error: "Faltan datos obligatorios." };
  }

  const { ip, userAgent } = getRequestMeta(req);

  // Verificación de existencia
  const { data: exists } = await supabase
    .from("usuarios")
    .select("id")
    .eq("correo", correo)
    .limit(1);

  if (exists && exists.length > 0) {
    return { status: 409, error: "El correo ya está registrado." };
  }

  const hashedPassword = await bcrypt.hash(contrasena, 10);

  const { data, error } = await supabase
    .from("usuarios")
    .insert([
      { nombre_completo, correo, contrasena: hashedPassword, rol_id, activo: true },
    ])
    .select();

  if (error) return { status: 500, error: "Error interno del servidor." };

  await registerAudit({
    userId: data[0].id,
    action: "REGISTER_SUCCESS",
    details: { correo, rol_id },
    ip,
    userAgent,
  });

  return {
    status: 201,
    data: {
      message: "Usuario registrado exitosamente.",
      user: {
        id: data[0].id,
        nombre_completo: data[0].nombre_completo,
        correo: data[0].correo,
        rol_id: data[0].rol_id,
        activo: data[0].activo,
      },
    },
  };
}

export async function createDemoAccount(req) {
  const timestamp = Date.now();
  const correo = `invitado_${timestamp}@demo.com`;
  const nombre = `Invitado ${new Date().toLocaleDateString()}`;
  const contrasena = Math.random().toString(36).slice(-8);

  const hashed = await bcrypt.hash(contrasena, 10);

  const { data, error } = await supabase
    .from("usuarios")
    .insert([
      {
        nombre_completo: nombre,
        correo,
        contrasena: hashed,
        rol_id: 5,
        activo: true,
      },
    ])
    .select();

  if (error) return { status: 500, error: "Error interno del servidor." };

  const token = jwt.sign(
    { id: data[0].id, correo: data[0].correo, rol_id: 5 },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    status: 201,
    data: {
      message: "Cuenta de demostración creada.",
      user: data[0],
      contrasena,
      token,
    },
  };
}
