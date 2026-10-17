(function () {
  // Abre o cierra las preguntas frecuentes al hacer clic en cada botón.
  document.querySelectorAll(".faq-question").forEach((button) => button.addEventListener("click", () => button.parentElement.classList.toggle("active")));

  // Si hay formulario de soporte, se prepara para enviar un mensaje.
  const form = document.getElementById("supportForm");
  if (!form) return;

  // Si hay un usuario logueado, rellena automáticamente nombre y correo.
  const user = SAL.getCurrentUser();
  if (user) {
    document.getElementById("supportName").value = `${user.nombre} ${user.apellido}`;
    document.getElementById("supportEmail").value = user.correo;
  }

  // Cuando se envía el mensaje, valida campos y guarda el caso en localStorage.
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = {
      id: `s-${Date.now()}`,
      name: document.getElementById("supportName").value.trim(),
      email: document.getElementById("supportEmail").value.trim(),
      subject: document.getElementById("supportSubject").value,
      message: document.getElementById("supportMessage").value.trim(),
      createdAt: new Date().toISOString()
    };

    const feedback = document.getElementById("supportFeedback");

    // Revisa que los datos obligatorios estén completos.
    if (!message.name || !message.email || !message.message) {
      feedback.className = "form-message error";
      feedback.textContent = "Completa los campos obligatorios.";
      return;
    }

    // Guarda el mensaje en almacenamiento local y muestra confirmación.
    SAL.write(SAL.SUPPORT_KEY, [...SAL.getSupportMessages(), message]);
    feedback.className = "form-message success";
    feedback.textContent = "Mensaje enviado. Te contactaremos en menos de 24 horas.";
    form.reset();
  });
}());
