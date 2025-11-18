// src/controllers/auth.controller.js
import {
  loginService,
  registerService,
  createDemoAccount
} from "../services/auth.service.js";

import supabase from "../config/supabase.js";
import jwt from "jsonwebtoken";

// HASH PARA TEST
export async function generarHashTest(req, res) {
  const bcrypt = (await import("bcryptjs")).default;
  const hash = await bcrypt.hash("123456", 10);
  return res.json({ hash });
}

// LOGIN
export async function loginController(req, res) {
  console.log("🟡 BODY RECIBIDO EN LOGIN:", req.body);
  const result = await loginService(req);

  if (result.error) {
    return res.status(result.status).json({ mensaje: result.error });
  }

  return res.status(result.status).json(result.data);
}

// REGISTRO
export async function registerController(req, res) {
  const result = await registerService(req);

  if (result.error) {
    return res.status(result.status).json({ mensaje: result.error });
  }

  return res.status(result.status).json(result.data);
}

// DEMO
export async function demoController(req, res) {
  const result = await createDemoAccount(req);

  if (result.error) {
    return res.status(result.status).json({ mensaje: result.error });
  }

  return res.status(result.status).json(result.data);
}

// TEST TOKEN
export async function testTokenController(req, res) {
  try {
    const userId = req.user.id; // viene del middleware verifyToken

    const { data: users } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", userId)
      .limit(1);

    if (!users || users.length === 0) {
      return res.status(401).json({ mensaje: "Usuario inexistente" });
    }

    const user = users[0];

    return res.json({
      ok: true,
      mensaje: "Token válido",
      usuario: {
        id: user.id,
        correo: user.correo,
        nombre_completo: user.nombre_completo,
        rol_id: user.rol_id,
      },
    });

  } catch (err) {
    console.error("❌ ERROR VALIDANDO TOKEN:", err.message);
    return res.status(401).json({ mensaje: "Token inválido", error: err.message });
  }
}
