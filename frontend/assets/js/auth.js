// assets/js/auth.js
// ========================================
// auth.js - Middleware del Frontend
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  // Solo tiene sentido validar acceso en páginas con topbar (dashboard)
  const topbarUser = document.getElementById("nombreUsuario");
  if (!topbarUser) return;

  validarAcceso();
});

async function validarAcceso() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const resp = await api.get("/test-token");
    const datos = await resp.json();

    // El backend responde: { ok: true, mensaje: "...", usuario: { ... } }
    if (!resp.ok || !datos.usuario) {
      throw new Error("Token inválido");
    }

    const usuario = datos.usuario;

    localStorage.setItem("usuario", JSON.stringify(usuario));

    const nombreEl = document.getElementById("nombreUsuario");
    if (nombreEl) nombreEl.textContent = usuario.correo || usuario.nombre_completo;

  } catch (error) {
    console.error("❌ Token inválido:", error);
    localStorage.clear();
    window.location.href = "login.html";
  }
}

// LOGOUT GLOBAL (por si quieres usarlo más adelante)
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// Opcionalmente lo dejo en window
window.logout = logout;
