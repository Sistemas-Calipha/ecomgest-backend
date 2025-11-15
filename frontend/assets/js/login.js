// assets/js/login.js
// ===============================
// LOGIN (versión corregida)
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const inputCorreo = document.getElementById("correo");
  const inputContrasena = document.getElementById("contrasena");
  const btnLogin = document.getElementById("btnLogin");
  const msgError = document.getElementById("msgError");

  if (inputCorreo) inputCorreo.focus();

  const hacerLogin = async () => {
    msgError.textContent = "";

    const correo = inputCorreo.value.trim();
    const contrasena = inputContrasena.value.trim();

    if (!correo || !contrasena) {
      msgError.textContent = "Ingrese correo y contraseña.";
      return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = "Ingresando...";

    try {
      // 1) Hacemos la petición
      const respuesta = await api.post("/login", { correo, contrasena });

      // 2) Intentamos leer el body como JSON
      const datos = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        const mensajeBackend = datos?.mensaje || "Credenciales incorrectas.";
        msgError.textContent = mensajeBackend;
        return;
      }

      // 3) Si OK, debe venir token y usuario
      if (!datos?.token || !datos?.usuario) {
        msgError.textContent = "Respuesta inesperada del servidor.";
        console.error("Login sin token o usuario:", datos);
        return;
      }

      // 4) Guardamos token y usuario
      localStorage.setItem("token", datos.token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

      // 5) Redirigimos al dashboard
      window.location.href = "dashboard.html";

    } catch (error) {
      console.error("❌ Error login:", error);
      msgError.textContent = "Error al conectar con el servidor.";
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = "Ingresar";
    }
  };

  btnLogin.addEventListener("click", hacerLogin);

  inputCorreo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") hacerLogin();
  });

  inputContrasena.addEventListener("keydown", (e) => {
    if (e.key === "Enter") hacerLogin();
  });
});
