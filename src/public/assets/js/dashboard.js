// assets/js/dashboard.js
console.log("🔥 dashboard.js cargado");

// ============================================
// dashboard.js - Versión estable y FUNCIONAL
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  await cargarUsuario();
  configurarLogout();
});

// --------------------------------------------
// Obtener usuario desde /auth/test-token
// --------------------------------------------
async function cargarUsuario() {
  try {
    console.log("🔍 Verificando token...");

    const respuesta = await api.get("/auth/test-token");
    const datos = await respuesta.json();

    console.log("📥 Respuesta test-token: ", datos);

    if (!respuesta.ok || !datos.usuario) {
      throw new Error("Token inválido");
    }

    const usuario = datos.usuario;

    localStorage.setItem("usuario", JSON.stringify(usuario));

    const nombreUi = document.getElementById("nombreUsuario");
    if (nombreUi) nombreUi.textContent = usuario.nombre_completo;

    mostrarSaludo(usuario);

    console.log("✅ Dashboard listo");

  } catch (error) {
    console.error("❌ Error:", error);
    localStorage.clear();
    window.location.href = "login.html";
  }
}

// --------------------------------------------
// Saludo dinámico
// --------------------------------------------
function mostrarSaludo(usuario) {
  const hora = new Date().getHours();
  let saludo = "Bienvenido";

  if (hora >= 6 && hora < 12) saludo = "Buenos días";
  else if (hora >= 12 && hora < 18) saludo = "Buenas tardes";
  else saludo = "Buenas noches";

  const titulo = document.querySelector("main h2");
  if (titulo) titulo.textContent = `${saludo}, ${usuario.nombre_completo} 👋`;
}

// --------------------------------------------
// Logout seguro
// --------------------------------------------
function configurarLogout() {
  const btn = document.getElementById("btnLogout");
  const modal = document.getElementById("modalLogout");
  const btnCancelar = document.getElementById("cancelLogout");
  const btnConfirmar = document.getElementById("confirmLogout");

  if (!btn) return;

btn.addEventListener("click", () => {
  document.getElementById("logoutModal").classList.remove("hidden");
});

// Botón cancelar
document.getElementById("cancelLogout").addEventListener("click", () => {
  document.getElementById("logoutModal").classList.add("hidden");
});

// Botón confirmar
document.getElementById("confirmLogout").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

}

