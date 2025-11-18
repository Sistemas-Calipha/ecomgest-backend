// assets/js/auth.js

console.log("🔐 AUTH.JS cargado correctamente");

document.addEventListener("DOMContentLoaded", () => {
  const topbarUser = document.getElementById("nombreUsuario");
  if (topbarUser) validarAcceso();
});

async function validarAcceso() {
  console.log("🟦 Verificando token...");

  const token = localStorage.getItem("token");
  if (!token) {
    return window.location.href = "login.html";
  }

  try {
    const resp = await api.get("/auth/test-token");
    const datos = await resp.json();

    console.log("🟢 Respuesta test-token:", datos);

    if (!resp.ok || !datos.usuario) {
      throw new Error("Token inválido");
    }

    localStorage.setItem("usuario", JSON.stringify(datos.usuario));

    const nombreEl = document.getElementById("nombreUsuario");
    if (nombreEl) nombreEl.textContent = datos.usuario.nombre_completo;

  } catch (err) {
    console.error("❌ Token inválido:", err);
    localStorage.clear();
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// (Opcional, pero útil si algún HTML lo quiere usar directamente)
window.logout = logout;

