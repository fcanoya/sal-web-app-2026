(function () {
  // Busca el formulario de inicio de sesión en la vista.
  const form = document.getElementById("loginForm");
  if (!form) return;

  // Cuando el usuario envía el formulario, intenta iniciar sesión.
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Área para mostrar errores de autenticación.
    const error = document.getElementById("loginError");

    // Llama a la función global de SAL para validar correo y contraseña.
    const user = SAL.login(document.getElementById("loginEmail").value, document.getElementById("loginPassword").value);

    // Si no existe el usuario con esos datos, muestra un mensaje y cancela la navegación.
    if (!user) {
      error.textContent = "El correo o la contraseña no son correctos.";
      return;
    }

    // Si la autenticación es correcta, limpia el error y redirige al panel.
    error.textContent = "";
    window.location.href = "dashboard.html";
  });
}());
