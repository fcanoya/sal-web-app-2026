(function () {
  // Se toma el formulario de agendamiento; si no existe, no se ejecuta nada.
  const form = document.getElementById("appointmentForm");
  if (!form) return;

  // La fecha mínima se fija en el día actual para evitar citas pasadas.
  const date = document.getElementById("date");
  date.min = new Date().toISOString().slice(0, 10);

  // Actualiza el resumen visible de la cita cuando cambia algún dato del formulario.
  const updateSummary = () => {
    document.getElementById("summarySpecialty").textContent = document.getElementById("specialty").value || "—";
    document.getElementById("summaryDoctor").textContent = document.getElementById("doctor").value || "—";
    document.getElementById("summaryDate").textContent = date.value ? `${date.value} · ${document.getElementById("time").value || "—"}` : "—";
  };

  // Cada cambio del formulario actualiza el resumen al instante.
  form.querySelectorAll("select, input").forEach((field) => field.addEventListener("change", updateSummary));

  // Al enviar el formulario, valida y guarda la nueva cita.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.getElementById("agendaMessage");
    const values = ["specialty", "doctor", "date", "time"].map((id) => document.getElementById(id).value);

    if (values.some((value) => !value)) {
      message.className = "form-message error";
      message.textContent = "Completa especialidad, profesional, fecha y hora.";
      return;
    }

    // Obtiene el usuario activo para asociar la cita al paciente logueado.
    const current = SAL.getCurrentUser();

    const appointment = {
      id: `c-${Date.now()}`,
      userId: current ? current.id : "guest",
      specialty: values[0],
      doctor: values[1],
      date: values[2],
      time: values[3],
      location: "Consultorio por confirmar",
      reason: document.getElementById("reason").value.trim(),
      status: "Confirmada",
      createdAt: new Date().toISOString()
    };

    // Guarda la cita en localStorage y redirige a la vista de Mis citas.
    SAL.saveAppointments([...SAL.getAppointments(), appointment]);
    message.className = "form-message success";
    message.textContent = "Cita creada correctamente. Redirigiendo a Mis citas…";
    form.reset();
    updateSummary();
    setTimeout(() => { window.location.href = "citas.html"; }, 600);
  });
}());
