(function () {
  // Contenedor donde se muestran las citas del usuario.
  const list = document.getElementById("appointmentsList");

  // Filtro activo en la vista: Todas, Confirmadas, Pendientes o Canceladas.
  let filter = "Todas";

  // Usuario actual; si existe, se muestran solo sus citas.
  const user = SAL.getCurrentUser();

  // Dibuja las citas según el filtro activo y la sesión actual.
  function render() {
    const appointments = SAL.getAppointments()
      .filter((item) => (!user || item.userId === user.id || item.userId === "guest") && (filter === "Todas" || item.status === filter))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

    list.innerHTML = appointments.length
      ? appointments.map((item) => `<article class="card appointment-item"><div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;"><div><strong>${SAL.escapeHtml(item.doctor)}</strong><p class="text-muted">${SAL.escapeHtml(item.specialty)}</p><p style="font-size:.85rem;margin-top:.35rem;">📅 ${SAL.escapeHtml(item.date)} · 🕒 ${SAL.escapeHtml(item.time)} · 📍 ${SAL.escapeHtml(item.location)}</p></div><span class="badge-status ${item.status === "Cancelada" ? "badge-cancelada" : item.status === "Pendiente" ? "badge-pendiente" : "badge-confirmada"}">${SAL.escapeHtml(item.status)}</span></div>${item.status !== "Cancelada" ? `<div style="display:flex;gap:.75rem;margin-top:1rem;"><button class="btn btn-danger js-cancel" data-id="${item.id}">Cancelar cita</button></div>` : `<button class="btn btn-secondary js-delete" data-id="${item.id}" style="margin-top:1rem;">Eliminar del historial</button>`}</article>`).join("")
      : '<div class="card empty-state">No hay citas en esta categoría. <a href="agenda.html" style="color:var(--primary);font-weight:700;">Agendar una cita</a></div>';
  }

  // Cuando el usuario cambia el filtro, actualiza la vista.
  document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    filter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
    render();
  }));

  // Maneja los botones de cancelar o eliminar una cita desde la lista.
  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;
    const id = button.dataset.id;

    if (button.classList.contains("js-cancel") && confirm("¿Quieres cancelar esta cita?")) {
      SAL.saveAppointments(SAL.getAppointments().map((item) => item.id === id ? { ...item, status: "Cancelada" } : item));
    }

    if (button.classList.contains("js-delete") && confirm("¿Eliminar esta cita del historial?")) {
      SAL.saveAppointments(SAL.getAppointments().filter((item) => item.id !== id));
    }

    render();
  });

  // Carga inicial de la lista de citas.
  render();
}());
