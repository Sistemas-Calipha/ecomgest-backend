// assets/js/dashboard.js
console.log("🔥 dashboard.js cargado");

// ============================================
// DASHBOARD - VERSIÓN ORDENADA Y ESTABLE
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
  await cargarUsuario();
  configurarLogout();
  configurarSidebar();
  configurarMenu(); // ← Nuevo
});

// --------------------------------------------
// Obtener usuario desde /auth/test-token
// --------------------------------------------
async function cargarUsuario() {
  try {
    console.log("🔍 Verificando token...");

    const respuesta = await api.get("/auth/test-token");
    const datos = await respuesta.json();

    console.log("📥 Respuesta test-token:", datos);

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
// Logout seguro + modal
// --------------------------------------------
function configurarLogout() {
  const btn = document.getElementById("btnLogout");

  if (!btn) return;

  btn.addEventListener("click", () => {
    document.getElementById("logoutModal").classList.remove("hidden");
  });

  document.getElementById("cancelLogout").addEventListener("click", () => {
    document.getElementById("logoutModal").classList.add("hidden");
  });

  document.getElementById("confirmLogout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// --------------------------------------------
// SIDEBAR COLLAPSE (Premium)
// --------------------------------------------
function configurarSidebar() {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleSidebar");

  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

// --------------------------------------------
// Cargar vistas dinámicas dentro del dashboard
// --------------------------------------------
async function loadView(path) {
  try {
    console.log("📄 loadView() → intentando cargar:", path);

    const container = document.querySelector(".content-area");
    if (!container) {
      console.error("❌ No se encontró .content-area");
      return;
    }

    const response = await fetch(path);

    if (!response.ok) {
      container.innerHTML = `<p style="color:red;">❌ Error cargando vista: ${path}</p>`;
      console.error("❌ Error HTTP:", response.status);
      return;
    }

    const html = await response.text();
    container.innerHTML = html;

    console.log("✅ Vista cargada correctamente:", path);

  } catch (error) {
    console.error("❌ Error cargando vista:", error);
  }
}

// --------------------------------------------
// Navegación del menú lateral
// --------------------------------------------
function configurarMenu() {
  console.log("📌 Inicializando menú lateral…");

  const menuUsers = document.getElementById("menuUsers");

  console.log("🔍 menuUsers encontrado?", !!menuUsers);

  if (!menuUsers) {
    console.error("❌ No se encontró #menuUsers");
    return;
  }

  menuUsers.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("👉 Clic en Usuarios");
    loadView("modules/users/users.html");
  });
}
