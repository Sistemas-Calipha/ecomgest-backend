// ------------------ IMPORTACIONES ------------------ //
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// ======================================================
// =============== CARGA DE VARIABLES ENV ===============
// ======================================================

// Cargar .env (en Render no es necesario, pero local sí)
dotenv.config();

console.log("🟦 DEBUG ENV → Cargando variables desde entorno…");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "[OK]" : "[VACÍO]");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "[OK]" : "[VACÍO]");
console.log("PORT:", process.env.PORT);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("❌ ERROR CRÍTICO → Faltan SUPABASE_URL o SUPABASE_KEY");
}

// ------------------ CONFIGURACIONES ------------------ //
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------ MIDDLEWARE ------------------ //
app.use(cors());
app.use(express.json({ strict: false, limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));


// ======================================================
// =================== CONEXIÓN SUPABASE =================
// ======================================================

// Validación defensiva
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("❌ No puedo iniciar Supabase: faltan SUPABASE_URL o SUPABASE_KEY");
}

console.log("🟦 Creando cliente Supabase…");

const supabase = createClient(

  console.log("🟦 DEBUG: SUPABASE_KEY (primeros 30 chars):", process.env.SUPABASE_KEY?.substring(0, 30)),
  console.log("🟦 DEBUG: SUPABASE_URL:", process.env.SUPABASE_URL),


  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

console.log("🟩 Supabase inicializado con:", process.env.SUPABASE_URL);

// ===================== TEST DIRECTO ===================== //
supabase
  .from("usuarios")
  .select("*")
  .limit(1)
  .then((r) => {
    console.log("🔥 TEST DIRECTO SUPABASE →", r);
  })
  .catch((err) => {
    console.error("🔥 ERROR TEST DIRECTO SUPABASE →", err);
  });

// ======================================================
// =============== HELPERS DE AUDITORÍA =================
// ======================================================

function getRequestMeta(req) {
  const ip =
    (req.headers["x-forwarded-for"]?.split(",")[0]) ||
    req.ip ||
    req.connection?.remoteAddress ||
    null;

  const userAgent = req.headers["user-agent"] || null;

  return { ip, userAgent };
}

async function registrarAuditoria({
  usuarioId = null,
  accion,
  detalle = {},
  ip = null,
  userAgent = null,
}) {
  try {
    const result = await supabase.from("auditoria").insert([
      {
        usuario_id: usuarioId,
        accion,
        detalle,
        ip,
        user_agent: userAgent,
      },
    ]);

    console.log("📌 Resultado auditoría:", result);
  } catch (err) {
    console.error("❌ Excepción guardando auditoría COMPLETA:", err);
  }
}

// ======================================================
// =============== MIDDLEWARE AUTENTICACIÓN =============
// ======================================================

// JWT
function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ mensaje: "Token no proporcionado." });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ mensaje: "Token inválido o expirado." });
    req.usuario = decoded;
    next();
  });
}

// Roles “duros”
function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol_id)) {
      return res.status(403).json({ mensaje: "No tienes permisos para realizar esta acción." });
    }
    next();
  };
}

// ------------------ MIDDLEWARE: PERMISOS ------------------ //
function autorizarPermiso(nombrePermiso) {
  return async (req, res, next) => {
    try {
      const rolId = req.usuario.rol_id;

      const { data: permiso, error: errorPermiso } = await supabase
        .from("permisos")
        .select("id")
        .eq("nombre", nombrePermiso)
        .eq("activo", true)
        .single();

      if (errorPermiso || !permiso) {
        return res.status(403).json({ mensaje: "Permiso inexistente." });
      }

      const { data: asignado, error: errorAsignado } = await supabase
        .from("roles_permisos")
        .select("id")
        .eq("rol_id", rolId)
        .eq("permiso_id", permiso.id)
        .limit(1);

      if (errorAsignado) throw errorAsignado;

      if (!asignado || asignado.length === 0) {
        return res.status(403).json({
          mensaje: "No tienes permiso para realizar esta acción.",
        });
      }

      next();
    } catch (err) {
      console.error("❌ Error en middleware de permisos:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  };
}

// ======================================================
// ======================== LOGIN =======================
// ======================================================

app.post("/login", async (req, res) => {
  console.log(">>>>>>>>>> BODY RECIBIDO <<<<<<<<<<");
  console.log(req.body); // 👈 Log útil

  const { correo, contrasena } = req.body;
  const { ip, userAgent } = getRequestMeta(req);

  if (!correo || !contrasena) {
    //await registrarAuditoria({
      //usuarioId: null,
      //accion: "LOGIN_DATOS_INCOMPLETOS",
      //detalle: { correo_intentado: correo },
      //ip,
      //userAgent,
    //});

    return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
  }

  try {
    const { data: usuarios } = await supabase
      .from("usuarios")
      .select("*")
      .eq("correo", correo)
      .limit(1);

    if (!usuarios?.length) {
      //await registrarAuditoria({
        //usuarioId: null,
        //accion: "LOGIN_FALLIDO_NO_EXISTE",
        //detalle: { correo_intentado: correo },
        //ip,
        //userAgent,
      //});

      return res.status(401).json({ mensaje: "Credenciales inválidas." });
    }

    const usuario = usuarios[0];
    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!passwordValida) {
      //await registrarAuditoria({
        //usuarioId: usuario.id,
        //accion: "LOGIN_FALLIDO_PASSWORD",
        //detalle: { correo },
        //ip,
        //userAgent,
      //});

      return res.status(401).json({ mensaje: "Credenciales inválidas." });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        correo: usuario.correo,
        rol_id: usuario.rol_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    await registrarAuditoria({
      usuarioId: usuario.id,
      accion: "LOGIN_EXITO",
      detalle: { correo },
      ip,
      userAgent,
    });

    res.json({
      mensaje: "Inicio de sesión exitoso.",
      usuario: {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        rol_id: usuario.rol_id,
        activo: usuario.activo,
      },
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    //await registrarAuditoria({
     // usuarioId: null,
     // accion: "LOGIN_ERROR_INTERNO",
    //  detalle: { correo, error: error.message },
   //   ip,
   //   userAgent,
  //  });
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
});

// ======================================================
// =============== REGISTRO PÚBLICO (CLIENTE) ===========
// ======================================================

app.post("/register", async (req, res) => {
  const { nombre_completo, correo, contrasena, rol_id = 4 } = req.body;

  if (!nombre_completo || !correo || !contrasena) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
  }

  try {
    const { data: existe } = await supabase
      .from("usuarios")
      .select("id")
      .eq("correo", correo)
      .limit(1);

    if (existe && existe.length > 0) {
      return res.status(409).json({ mensaje: "El correo ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const { data } = await supabase
      .from("usuarios")
      .insert([
        { nombre_completo, correo, contrasena: hashedPassword, rol_id, activo: true },
      ])
      .select();

    const { ip, userAgent } = getRequestMeta(req);

    await registrarAuditoria({
      usuarioId: data[0].id,
      accion: "REGISTRO_PUBLICO_EXITO",
      detalle: { correo: data[0].correo, rol_id },
      ip,
      userAgent,
    });

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente.",
      usuario: {
        id: data[0].id,
        nombre_completo: data[0].nombre_completo,
        correo: data[0].correo,
        rol_id: data[0].rol_id,
        activo: data[0].activo,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
});

// ======================================================
// =============== USUARIO INVITADO / DEMO ==============
// ======================================================

app.post("/demo", async (req, res) => {
  try {
    const timestamp = Date.now();
    const correo = `invitado_${timestamp}@demo.com`;
    const nombre_completo = `Invitado ${new Date().toLocaleDateString()}`;
    const contrasena = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const { data } = await supabase
      .from("usuarios")
      .insert([
        {
          nombre_completo,
          correo,
          contrasena: hashedPassword,
          rol_id: 5,
          activo: true,
        },
      ])
      .select();

    const token = jwt.sign(
      {
        id: data[0].id,
        correo: data[0].correo,
        rol_id: 5,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      mensaje: "Cuenta de demostración creada con éxito.",
      usuario: data[0],
      contrasena,
      token,
    });
  } catch (error) {
    console.error("❌ Error creando cuenta demo:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
});

// ======================================================
// ================= PERFIL DEL USUARIO =================
// ======================================================

app.get("/perfil", verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { ip, userAgent } = getRequestMeta(req);

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("id, nombre_completo, correo, rol_id, activo, creado_en")
      .eq("id", userId)
      .single();

    if (error || !usuario) {
      await registrarAuditoria({
        usuarioId: userId,
        accion: "PERFIL_NO_ENCONTRADO",
        detalle: { endpoint: "/perfil" },
        ip,
        userAgent,
      });

      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }

    await registrarAuditoria({
      usuarioId: userId,
      accion: "PERFIL_CONSULTADO",
      detalle: { endpoint: "/perfil" },
      ip,
      userAgent,
    });

    return res.status(200).json({
      mensaje: "Perfil obtenido con éxito.",
      usuario,
    });
  } catch (err) {
    console.error("❌ Error al obtener perfil:", err.message);
    return res.status(500).json({ mensaje: "Error interno del servidor." });
  }
});

// ======================================================
// =============== CRUD USUARIOS (PERMISOS) =============
// ======================================================

// LISTAR USUARIOS – permiso: ver_usuarios
app.get(
  "/usuarios",
  verificarToken,
  autorizarPermiso("ver_usuarios"),
  async (req, res) => {
    const { ip, userAgent } = getRequestMeta(req);

    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre_completo, correo, rol_id, activo, creado_en")
      .order("creado_en", { ascending: false });

    if (error) {
      console.error("Error al obtener usuarios:", error);
      await registrarAuditoria({
        usuarioId: req.usuario.id,
        accion: "USUARIOS_LISTAR_ERROR",
        detalle: { error: error.message },
        ip,
        userAgent,
      });
      return res.status(500).json({ mensaje: "Error al obtener usuarios." });
    }

    await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: "USUARIOS_LISTAR_OK",
      detalle: { cantidad: data.length },
      ip,
      userAgent,
    });

    res.json({ usuarios: data });
  }
);

// CREAR USUARIO – permiso: crear_usuario
app.post(
  "/usuarios",
  verificarToken,
  autorizarPermiso("crear_usuario"),
  async (req, res) => {
    const { nombre_completo, correo, contrasena, rol_id, activo = true } = req.body;
    const { ip, userAgent } = getRequestMeta(req);

    if (!nombre_completo || !correo || !rol_id) {
      return res.status(400).json({ mensaje: "Nombre, correo y rol son obligatorios." });
    }

    try {
      const { data: existe } = await supabase
        .from("usuarios")
        .select("id")
        .eq("correo", correo)
        .limit(1);

      if (existe && existe.length > 0) {
        return res.status(409).json({ mensaje: "El correo ya está registrado." });
      }

      const passwordFinal = contrasena || Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(passwordFinal, 10);

      const { data, error: errorInsert } = await supabase
        .from("usuarios")
        .insert([
          {
            nombre_completo,
            correo,
            contrasena: hashedPassword,
            rol_id,
            activo,
          },
        ])
        .select();

      if (errorInsert) throw errorInsert;

      await registrarAuditoria({
        usuarioId: req.usuario.id,
        accion: "USUARIO_CREAR",
        detalle: {
          nuevo_usuario_id: data[0].id,
          correo: data[0].correo,
          rol_id,
        },
        ip,
        userAgent,
      });

      res.status(201).json({
        mensaje: "Usuario creado exitosamente.",
        usuario: {
          id: data[0].id,
          nombre_completo: data[0].nombre_completo,
          correo: data[0].correo,
          rol_id: data[0].rol_id,
          activo: data[0].activo,
        },
        contrasena_generada: contrasena ? null : passwordFinal,
      });
    } catch (error) {
      console.error("❌ Error al crear usuario:", error);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// DETALLE DE USUARIO – permiso: ver_usuarios
app.get(
  "/usuarios/:id",
  verificarToken,
  autorizarPermiso("ver_usuarios"),
  async (req, res) => {
    const { id } = req.params;
    const { ip, userAgent } = getRequestMeta(req);

    try {
      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("id, nombre_completo, correo, rol_id, activo, creado_en")
        .eq("id", id)
        .single();

      if (error || !usuario) {
        await registrarAuditoria({
          usuarioId: req.usuario.id,
          accion: "USUARIO_DETALLE_NO_ENCONTRADO",
          detalle: { id },
          ip,
          userAgent,
        });
        return res.status(404).json({ mensaje: "Usuario no encontrado." });
      }

      await registrarAuditoria({
        usuarioId: req.usuario.id,
        accion: "USUARIO_DETALLE_OK",
        detalle: { id },
        ip,
        userAgent,
      });

      res.json({ usuario });
    } catch (err) {
      console.error("❌ Error obteniendo usuario:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// ACTUALIZAR USUARIO – permiso: editar_usuario
app.put(
  "/usuarios/:id",
  verificarToken,
  autorizarPermiso("editar_usuario"),
  async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, correo, rol_id, activo } = req.body;
    const { ip, userAgent } = getRequestMeta(req);

    const campos = {};
    if (nombre_completo !== undefined) campos.nombre_completo = nombre_completo;
    if (correo !== undefined) campos.correo = correo;
    if (rol_id !== undefined) campos.rol_id = rol_id;
    if (activo !== undefined) campos.activo = activo;

    if (Object.keys(campos).length === 0) {
      return res.status(400).json({ mensaje: "No hay campos para actualizar." });
    }

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .update(campos)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await registrarAuditoria({
        usuarioId: req.usuario.id,
        accion: "USUARIO_ACTUALIZAR",
        detalle: { id, cambios: campos },
        ip,
        userAgent,
      });

      res.json({
        mensaje: "Usuario actualizado correctamente.",
        usuario: {
          id: data.id,
          nombre_completo: data.nombre_completo,
          correo: data.correo,
          rol_id: data.rol_id,
          activo: data.activo,
        },
      });
    } catch (err) {
      console.error("❌ Error actualizando usuario:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// CAMBIAR ESTADO – permiso: desactivar_usuario
app.patch(
  "/usuarios/:id/estado",
  verificarToken,
  autorizarPermiso("desactivar_usuario"),
  async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;
    const { ip, userAgent } = getRequestMeta(req);

    if (activo === undefined) {
      return res.status(400).json({ mensaje: "Debe indicar el estado 'activo'." });
    }

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .update({ activo })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await registrarAuditoria({
        usuarioId: req.usuario.id,
        accion: "USUARIO_CAMBIAR_ESTADO",
        detalle: { id, activo },
        ip,
        userAgent,
      });

      res.json({
        mensaje: `Usuario ${activo ? "activado" : "desactivado"} correctamente.`,
        usuario: {
          id: data.id,
          nombre_completo: data.nombre_completo,
          correo: data.correo,
          rol_id: data.rol_id,
          activo: data.activo,
        },
      });
    } catch (err) {
      console.error("❌ Error cambiando estado de usuario:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// RESET PASSWORD – permiso: editar_usuario
app.post(
  "/usuarios/:id/reset-password",
  verificarToken,
  autorizarPermiso("editar_usuario"),
  async (req, res) => {
    const { id } = req.params;
    const { ip, userAgent } = getRequestMeta(req);

    try {
      const nuevaPassword = Math.random().toString(36).slice(-10);
      const hashed = await bcrypt.hash(nuevaPassword, 10);

      const { data, error } = await supabase
        .from("usuarios")
        .update({ contrasena: hashed })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await registrarAuditoria({
        usuarioId: req.usuario.id,
        accion: "USUARIO_RESET_PASSWORD",
        detalle: { id },
        ip,
        userAgent,
      });

      res.json({
        mensaje: "Contraseña reseteada correctamente.",
        usuario: {
          id: data.id,
          nombre_completo: data.nombre_completo,
          correo: data.correo,
          rol_id: data.rol_id,
          activo: data.activo,
        },
        nueva_contrasena: nuevaPassword,
      });
    } catch (err) {
      console.error("❌ Error reseteando contraseña:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// ======================================================
// ================= CRUD ROLES (PERMISOS) ==============
// ======================================================

// LISTAR ROLES – permiso: ver_roles
app.get(
  "/roles",
  verificarToken,
  autorizarPermiso("ver_roles"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;

      res.json({ roles: data });
    } catch (err) {
      console.error("❌ Error obteniendo roles:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// CREAR ROL – permiso: crear_rol
app.post(
  "/roles",
  verificarToken,
  autorizarPermiso("crear_rol"),
  async (req, res) => {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: "El nombre del rol es obligatorio." });
    }

    try {
      const { data: existe } = await supabase
        .from("roles")
        .select("id")
        .eq("nombre", nombre.toLowerCase())
        .limit(1);

      if (existe?.length > 0) {
        return res.status(409).json({ mensaje: "Ya existe un rol con ese nombre." });
      }

      const { data, error } = await supabase
        .from("roles")
        .insert([{ nombre: nombre.toLowerCase(), descripcion }])
        .select();

      if (error) throw error;

      res.status(201).json({ mensaje: "Rol creado correctamente.", rol: data[0] });
    } catch (err) {
      console.error("❌ Error creando rol:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// EDITAR ROL – permiso: editar_rol
app.put(
  "/roles/:id",
  verificarToken,
  autorizarPermiso("editar_rol"),
  async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const cambios = {};
    if (nombre !== undefined) cambios.nombre = nombre.toLowerCase();
    if (descripcion !== undefined) cambios.descripcion = descripcion;

    if (Object.keys(cambios).length === 0) {
      return res.status(400).json({ mensaje: "No hay cambios para actualizar." });
    }

    try {
      const { data, error } = await supabase
        .from("roles")
        .update(cambios)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      res.json({ mensaje: "Rol actualizado correctamente.", rol: data });
    } catch (err) {
      console.error("❌ Error actualizando rol:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// ACTIVAR / DESACTIVAR ROL – permiso: activar_rol
app.patch(
  "/roles/:id/estado",
  verificarToken,
  autorizarPermiso("activar_rol"),
  async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo === undefined) {
      return res.status(400).json({ mensaje: "Debe indicar el valor de 'activo'." });
    }

    try {
      const { data: usuarios } = await supabase
        .from("usuarios")
        .select("id")
        .eq("rol_id", id);

      if (usuarios && usuarios.length > 0 && activo === false) {
        return res.status(409).json({
          mensaje: "No se puede desactivar este rol porque tiene usuarios asignados.",
        });
      }

      const { data, error } = await supabase
        .from("roles")
        .update({ activo })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        mensaje: `Rol ${activo ? "activado" : "desactivado"} correctamente.`,
        rol: data,
      });
    } catch (err) {
      console.error("❌ Error cambiando estado del rol:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// ======================================================
// ===== CRUD ASIGNACIÓN DE PERMISOS A ROLES ============
// ======================================================

// LISTAR PERMISOS DE UN ROL
app.get(
  "/roles/:id/permisos",
  verificarToken,
  autorizarRoles(1), // Solo admin puede ver asignaciones
  async (req, res) => {
    const { id } = req.params;

    try {
      const { data, error } = await supabase
        .from("roles_permisos")
        .select("id, permiso_id, permisos(nombre, descripcion, modulo, accion, activo)")
        .eq("rol_id", id);

      if (error) throw error;

      res.json({ permisos_asignados: data });
    } catch (err) {
      console.error("❌ Error obteniendo permisos del rol:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// ASIGNAR PERMISOS A UN ROL (uno o varios)
app.post(
  "/roles/:id/permisos",
  verificarToken,
  autorizarRoles(1),
  async (req, res) => {
    const { id } = req.params;
    const { permisos } = req.body; // array de IDs

    if (!Array.isArray(permisos) || permisos.length === 0) {
      return res.status(400).json({
        mensaje: "Debes enviar un array de IDs de permisos.",
      });
    }

    try {
      const inserts = permisos.map((pid) => ({
        rol_id: id,
        permiso_id: pid,
        activo: true,
      }));

      const { data, error } = await supabase
        .from("roles_permisos")
        .insert(inserts)
        .select();

      if (error) throw error;

      res.status(201).json({
        mensaje: "Permisos asignados correctamente.",
        asignados: data,
      });
    } catch (err) {
      console.error("❌ Error asignando permisos:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// QUITAR PERMISO DE UN ROL
app.delete(
  "/roles/:id/permisos/:permisoId",
  verificarToken,
  autorizarRoles(1),
  async (req, res) => {
    const { id, permisoId } = req.params;

    try {
      const { data, error } = await supabase
        .from("roles_permisos")
        .delete()
        .eq("rol_id", id)
        .eq("permiso_id", permisoId)
        .select();

      if (error) throw error;

      res.json({
        mensaje: "Permiso eliminado del rol correctamente.",
        eliminado: data,
      });
    } catch (err) {
      console.error("❌ Error eliminando permiso del rol:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// ======================================================
// ================== CRUD DE PERMISOS ==================
// ======================================================

// LISTAR PERMISOS – permiso: ver_permisos
app.get(
  "/permisos",
  verificarToken,
  autorizarPermiso("ver_permisos"),
  async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("permisos")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;

      res.json({ permisos: data });
    } catch (err) {
      console.error("❌ Error obteniendo permisos:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// CREAR PERMISO – permiso: crear_permiso
app.post(
  "/permisos",
  verificarToken,
  autorizarPermiso("crear_permiso"),
  async (req, res) => {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: "El nombre del permiso es obligatorio." });
    }

    try {
      const { data: existe } = await supabase
        .from("permisos")
        .select("id")
        .eq("nombre", nombre.toLowerCase())
        .limit(1);

      if (existe?.length > 0) {
        return res.status(409).json({ mensaje: "Ya existe un permiso con ese nombre." });
      }

      const { data, error } = await supabase
        .from("permisos")
        .insert([{ nombre: nombre.toLowerCase(), descripcion }])
        .select();

      if (error) throw error;

      res.status(201).json({ mensaje: "Permiso creado correctamente.", permiso: data[0] });
    } catch (err) {
      console.error("❌ Error creando permiso:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// EDITAR PERMISO – permiso: editar_permiso
app.put(
  "/permisos/:id",
  verificarToken,
  autorizarPermiso("editar_permiso"),
  async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const cambios = {};
    if (nombre !== undefined) cambios.nombre = nombre.toLowerCase();
    if (descripcion !== undefined) cambios.descripcion = descripcion;

    if (Object.keys(cambios).length === 0) {
      return res.status(400).json({ mensaje: "No hay cambios para actualizar." });
    }

    try {
      const { data, error } = await supabase
        .from("permisos")
        .update(cambios)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      res.json({ mensaje: "Permiso actualizado correctamente.", permiso: data });
    } catch (err) {
      console.error("❌ Error actualizando permiso:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// ACTIVAR / DESACTIVAR PERMISO – permiso: activar_permiso
app.patch(
  "/permisos/:id/estado",
  verificarToken,
  autorizarPermiso("activar_permiso"),
  async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo === undefined) {
      return res.status(400).json({ mensaje: "Debe indicar el valor de 'activo'." });
    }

    try {
      const { data, error } = await supabase
        .from("permisos")
        .update({ activo })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        mensaje: `Permiso ${activo ? "activado" : "desactivado"} correctamente.`,
        permiso: data,
      });
    } catch (err) {
      console.error("❌ Error cambiando estado del permiso:", err);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// ======================================================
// ======= CRON + ENDPOINTS PARA INVITADOS DEMO =========
// ======================================================

cron.schedule("0 3 * * *", async () => {
  console.log("🕒 Ejecutando limpieza diaria de usuarios invitados...");

  try {
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const { data: invitados } = await supabase
      .from("usuarios")
      .select("id")
      .eq("rol_id", 5)
      .eq("activo", true)
      .lt("creado_en", hace7Dias.toISOString());

    if (!invitados?.length) return;

    await supabase
      .from("usuarios")
      .update({ activo: false })
      .in("id", invitados.map((u) => u.id));

    console.log(`🧹 Invitados desactivados: ${invitados.length}`);
  } catch (err) {
    console.error("❌ Error en cron invitados:", err.message);
  }
});

// Limpieza manual
app.get("/desactivar-invitados", async (req, res) => {
  try {
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const { data: invitados } = await supabase
      .from("usuarios")
      .select("id, nombre_completo, creado_en")
      .eq("rol_id", 5)
      .eq("activo", true)
      .lt("creado_en", hace7Dias.toISOString());

    if (!invitados?.length) {
      return res.json({ mensaje: "No hay invitados para desactivar." });
    }

    await supabase
      .from("usuarios")
      .update({ activo: false })
      .in("id", invitados.map((u) => u.id));

    res.json({ mensaje: "Invitados desactivados.", usuarios: invitados });
  } catch (err) {
    console.error("❌ Error desactivando invitados:", err.message);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
});

// Reactivar invitado — solo admin (rol 1)
app.post(
  "/reactivar-invitado",
  verificarToken,
  autorizarRoles(1),
  async (req, res) => {
    try {
      const { correo } = req.body;

      if (!correo) {
        return res.status(400).json({ mensaje: "Debe proporcionar el correo del invitado." });
      }

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("*")
        .eq("correo", correo)
        .eq("rol_id", 5)
        .single();

      if (!usuario) {
        return res.status(404).json({ mensaje: "Invitado no encontrado." });
      }

      await supabase
        .from("usuarios")
        .update({ activo: true, creado_en: new Date().toISOString() })
        .eq("id", usuario.id);

      res.json({
        mensaje: "Usuario invitado reactivado correctamente.",
        usuario,
        nuevo_periodo_hasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch (err) {
      console.error("❌ Error reactivando invitado:", err.message);
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
);

// ======================================================
// ================== ENDPOINTS DE TESTEO ===============
// ======================================================

// Verificar que el servidor funciona
app.get("/test", (req, res) => {
  res.json({ ok: true, mensaje: "Servidor funcionando correctamente." });
});

// Test de token
app.get("/test-token", verificarToken, (req, res) => {
  res.json({
    ok: true,
    mensaje: "Token válido.",
    usuario: req.usuario,
  });
});

// Test de permisos (pide ver_usuarios)
app.get(
  "/test-permiso",
  verificarToken,
  autorizarPermiso("ver_usuarios"),
  (req, res) => {
    res.json({ ok: true, mensaje: "Tienes permiso ver_usuarios." });
  }
);

// Test para ver si el usuario tiene permiso para crear usuarios
app.get(
  "/test-crear-user",
  verificarToken,
  autorizarPermiso("crear_usuario"),
  (req, res) => {
    res.json({ ok: true, mensaje: "Tienes permiso crear_usuario." });
  }
);

// Test para ver si el usuario puede ver roles
app.get(
  "/test-ver-roles",
  verificarToken,
  autorizarPermiso("ver_roles"),
  (req, res) => {
    res.json({ ok: true, mensaje: "Tienes permiso ver_roles." });
  }
);

// Test para ver si el usuario es admin por rol duro
app.get(
  "/test-es-admin",
  verificarToken,
  autorizarRoles(1),
  (req, res) => {
    res.json({ ok: true, mensaje: "Eres admin por rol_id = 1." });
  }
);

// ======================================================
// =================== FRONTEND STATIC ==================
// ======================================================

app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend operativo en Render 🚀",
    timestamp: new Date().toISOString(),
  });
});



// ======================================================
// ================== INICIAR SERVIDOR ==================
// ======================================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
