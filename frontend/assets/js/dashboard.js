// assets/js/dashboard.js
console.log("🔥 dashboard.js cargado");

// ============================================
// dashboard.js - Versión estable
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  await cargarUsuario();
  configurarLogout();
});

// --------------------------------------------
// Cargar perfil del usuario desde backend
// --------------------------------------------
async function cargarUsuario() {
  try {
    const respuesta = await api.get("/perfil");

    if (!respuesta.ok) {
      throw new Error("No autorizado");
    }

    const datos = await respuesta.json();
    const usuario = datos.usuario;

    if (!usuario) throw new Error("Usuario no encontrado");

    localStorage.setItem("usuario", JSON.stringify(usuario));

    const nombreUi = document.getElementById("nombreUsuario");
    if (nombreUi) nombreUi.textContent = usuario.nombre_completo;

    mostrarSaludo(usuario);

  } catch (error) {
    console.error("❌ Error cargando perfil:", error);

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
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
  if (titulo) {
    titulo.textContent = `${saludo}, ${usuario.nombre_completo} 👋`;
  }
}

// --------------------------------------------
// Logout seguro
// --------------------------------------------
function configurarLogout() {
  const btn = document.getElementById("btnLogout");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!confirm("¿Seguro que deseas salir?")) return;

    localStorage.clear();
    window.location.href = "login.html";
  });
}
