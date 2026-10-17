/* Utilidades compartidas de SAL. Todo el estado de la demo vive en localStorage. */
(function () {
  "use strict";

  // Claves usadas para guardar usuarios, sesión, citas y mensajes de soporte.
  const USER_KEY = "usuarios";
  const SESSION_KEY = "sal_sesion";
  const APPOINTMENT_KEY = "sal_citas";
  const SUPPORT_KEY = "sal_soporte";

  // Usuarios iniciales de prueba que se crean automáticamente si no hay registros.
  const seedUsers = [
    { id: "u-laura", nombre: "Laura", apellido: "Martínez", correo: "laura.martinez@sal.com", cedula: "1001001001", telefono: "3001001001", password: "SAL123" },
    { id: "u-carlos", nombre: "Carlos", apellido: "Rodríguez", correo: "carlos.rodriguez@sal.com", cedula: "1001001002", telefono: "3001001002", password: "SAL123" },
    { id: "u-mariana", nombre: "Mariana", apellido: "Gómez", correo: "mariana.gomez@sal.com", cedula: "1001001003", telefono: "3001001003", password: "SAL123" }
  ];

  // Lee un valor de localStorage y devuelve el valor por defecto si no existe.
  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  // Guarda cualquier dato en localStorage como texto JSON.
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Obtiene la lista de usuarios, migrando una versión antigua si existe.
  function getUsers() {
    const users = read(USER_KEY, null);
    if (!Array.isArray(users)) {
      const legacyUsers = read("sal_usuarios", null);
      if (Array.isArray(legacyUsers) && legacyUsers.length) {
        const migrated = legacyUsers.map((user, index) => ({ ...user, id: user.id || `u-legacy-${index}` }));
        write(USER_KEY, migrated);
        return migrated;
      }
      write(USER_KEY, seedUsers);
      return seedUsers.slice();
    }
    return users;
  }

  // Retorna la sesión actual almacenada del usuario autenticado.
  function getSession() {
    return read(SESSION_KEY, null);
  }

  // Busca el usuario activo según la sesión guardada en localStorage.
  function getCurrentUser() {
    const session = getSession();
    return session ? getUsers().find((user) => user.id === session.userId || user.correo === session.correo) || null : null;
  }

  // Valida el login comparando correo y contraseña con los usuarios guardados.
  function login(correo, password) {
    const user = getUsers().find((item) => item.correo.toLowerCase() === correo.trim().toLowerCase() && item.password === password);
    if (!user) return null;
    write(SESSION_KEY, { userId: user.id, correo: user.correo });
    return user;
  }

  // Cierra la sesión del usuario actual.
  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  // Obtiene todas las citas agendadas.
  function getAppointments() {
    const appointments = read(APPOINTMENT_KEY, []);
    return Array.isArray(appointments) ? appointments : [];
  }

  // Guarda la lista de citas en almacenamiento local.
  function saveAppointments(appointments) {
    write(APPOINTMENT_KEY, appointments);
  }

  // Lee los mensajes de soporte enviados por usuarios.
  function getSupportMessages() {
    const messages = read(SUPPORT_KEY, []);
    return Array.isArray(messages) ? messages : [];
  }

  // Escapa caracteres HTML para evitar inyección en contenido renderizado.
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[character]));
  }

  // Genera las iniciales del nombre y apellido del usuario para mostrar avatar.
  function initials(user) {
    if (!user) return "•";
    return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase();
  }

  // Actualiza los textos del encabezado con el usuario logueado y activa el menú móvil.
  function bindHeader() {
    const user = getCurrentUser();
    document.querySelectorAll("[data-user-name]").forEach((element) => {
      element.textContent = user ? `${user.nombre} ${user.apellido}` : "Invitado";
    });
    document.querySelectorAll("[data-user-initials]").forEach((element) => {
      element.textContent = initials(user);
    });
    document.querySelectorAll(".js-logout").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        logout();
        window.location.href = "../index.html";
      });
    });
    document.querySelectorAll(".js-menu-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const menu = document.getElementById(button.getAttribute("aria-controls"));
        if (!menu) return;
        const open = menu.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(open));
      });
    });
  }

  // Exponemos la API de SAL para que todos los otros scripts la usen.
  window.SAL = {
    USER_KEY, SESSION_KEY, APPOINTMENT_KEY, SUPPORT_KEY, read, write,
    getUsers, getSession, getCurrentUser, login, logout, getAppointments,
    saveAppointments, getSupportMessages, escapeHtml, initials, bindHeader
  };

  // Cuando la página termina de cargarse, se actualiza el encabezado.
  document.addEventListener("DOMContentLoaded", bindHeader);
}());
