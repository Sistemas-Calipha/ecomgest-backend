import {
  loginService,
  registerService,
  createDemoAccount
} from "../services/auth.service.js";

export async function loginController(req, res) {
  console.log("🟡 BODY RECIBIDO EN LOGIN:", req.body);
  const result = await loginService(req);

  if (result.error) {
    return res.status(result.status).json({ mensaje: result.error });
  }

  return res.status(result.status).json(result.data);
}

export async function registerController(req, res) {
  const result = await registerService(req);

  if (result.error) {
    return res.status(result.status).json({ mensaje: result.error });
  }

  return res.status(result.status).json(result.data);
}

export async function demoController(req, res) {
  const result = await createDemoAccount(req);

  if (result.error) {
    return res.status(result.status).json({ mensaje: result.error });
  }

  return res.status(result.status).json(result.data);
}
