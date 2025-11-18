// assets/js/login.js
// =====================================
// LOGIN – versión final optimizada
// =====================================

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
      // 1) Petición al backend
      const respuesta = await api.post("/auth/login", { correo, contrasena });
      const datos = await respuesta.json().catch(() => null);

      console.log("📦 RESPUESTA DEL BACKEND:", datos);

      if (!respuesta.ok) {
        msgError.textContent = datos?.mensaje || "Credenciales incorrectas.";
        return;
      }

      // 2) Validación mínima
      if (!datos?.token || !datos?.user) {
        msgError.textContent = "Respuesta inesperada del servidor.";
        console.error("⚠️ Login sin token o user:", datos);
        return;
      }

      // 3) Guardar token y usuario
      localStorage.setItem("token", datos.token);
      localStorage.setItem("usuario", JSON.stringify(datos.user));

      console.log("🔐 TOKEN GUARDADO:", datos.token);

      // 4) 👉 Redirección directa (ya no necesitamos el delay)
      window.location.href = "dashboard.html";

    } catch (error) {
      console.error("❌ Error login:", error);
      msgError.textContent = "Error al conectar con el servidor.";
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = "Ingresar";
    }
  };

  // Eventos
  btnLogin.addEventListener("click", hacerLogin);

  inputCorreo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") hacerLogin();
  });

  inputContrasena.addEventListener("keydown", (e) => {
    if (e.key === "Enter") hacerLogin();
  });
});
