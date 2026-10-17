(function () {
  "use strict";

  // Se toma el formulario de registro; si no existe, se termina aquí.
  const form = document.getElementById("userForm");
  if (!form || !window.SAL) return;

  // Campos que se validan en el registro y sus IDs de mensaje de error.
  const fields = ["nombre", "apellido", "correo", "cedula", "telefono", "password", "confirmPassword"];
  const errorIds = {
    nombre: "errorNombre", apellido: "errorApellido", correo: "errorCorreo",
    cedula: "errorCedula", telefono: "errorTelefono", password: "errorPassword",
    confirmPassword: "errorConfirmPassword"
  };

  // Reglas de validación para cada campo del formulario.
  const rules = {
    nombre: [/^[\p{L} ]{2,50}$/u, "Escribe un nombre válido (mínimo 2 letras)."],
    apellido: [/^[\p{L} ]{2,50}$/u, "Escribe un apellido válido (mínimo 2 letras)."],
    correo: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Ingresa un correo válido."],
    cedula: [/^\d{6,12}$/, "La cédula debe tener entre 6 y 12 dígitos."],
    telefono: [/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos."],
    password: [/^.{6}$/, "La contraseña debe tener exactamente 6 caracteres."]
  };

  // Muestra el error del campo indicado y marca si el input fue inválido.
  function setError(field, message) {
    const element = document.getElementById(errorIds[field]);
    if (element) element.textContent = message || "";
    const input = document.getElementById(field);
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  // Revisa todos los campos y devuelve los errores encontrados.
  function validate() {
    const value = Object.fromEntries(fields.map((field) => [field, document.getElementById(field).value.trim()]));
    const errors = {};

    Object.entries(rules).forEach(([field, rule]) => {
      if (!rule[0].test(value[field])) errors[field] = rule[1];
    });

    if (value.confirmPassword !== value.password) errors.confirmPassword = "Las contraseñas no coinciden.";

    fields.forEach((field) => setError(field, errors[field] || ""));
    return { value, errors };
  }

  // Mientras el usuario escribe, si un campo ya fue marcado como inválido, se valida de nuevo.
  fields.forEach((field) => document.getElementById(field).addEventListener("input", () => {
    if (document.getElementById(field).getAttribute("aria-invalid") === "true") validate();
  }));

  // Al enviar el formulario, valida datos, dupicados, términos y guarda el usuario.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = validate();
    const duplicate = document.getElementById("errorDuplicado");
    const termsError = document.getElementById("errorTerms");
    const success = document.getElementById("registroExitoso");

    duplicate.textContent = "";
    termsError.textContent = "";
    success.textContent = "";

    const users = SAL.getUsers();
    const email = result.value.correo.toLowerCase();

    // Verifica que no exista otro usuario con el mismo correo, cédula o teléfono.
    if (users.some((user) => user.correo.toLowerCase() === email || user.cedula === result.value.cedula || user.telefono === result.value.telefono)) {
      duplicate.textContent = "El correo, la cédula o el teléfono ya están registrados.";
      result.errors.duplicado = true;
    }

    // Revisa si el usuario aceptó los términos del servicio.
    if (!document.getElementById("terms").checked) {
      termsError.textContent = "Debes aceptar los términos para continuar.";
      result.errors.terms = true;
    }

    // Si hay errores, no guarda ni registra al usuario.
    if (Object.keys(result.errors).length) return;

    // Crea el objeto con los datos del nuevo usuario y lo agrega a la lista.
    users.push({
      id: `u-${Date.now()}`, nombre: result.value.nombre, apellido: result.value.apellido,
      correo: email, cedula: result.value.cedula, telefono: result.value.telefono, password: result.value.password
    });

    // Guarda el nuevo usuario pero no crea sesión automática.
    // Se muestra un mensaje claro para que el usuario continúe con el inicio de sesión.
    SAL.write(SAL.USER_KEY, users);

    form.reset();
    success.textContent = "Usuario registrado correctamente. Ya puedes iniciar sesión con tu correo y contraseña.";
    document.getElementById("registroActions").style.display = "block";
  });
}());
