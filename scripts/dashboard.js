(function () {
  // Obtiene el usuario actual para mostrar solo sus citas.
  const user = SAL.getCurrentUser();

  // Filtra las citas del usuario actual o muestra todas si no hay sesión.
  const appointments = SAL.getAppointments().filter((item) => !user || item.userId === user.id);

  // Ordena por fecha y hora para ubicar la próxima cita.
  const sorted = appointments.slice().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  // Busca la próxima cita activa, priorizando la fecha más cercana.
  const next = sorted.find((item) => item.status !== "Cancelada" && item.date >= new Date().toISOString().slice(0, 10)) || sorted.find((item) => item.status !== "Cancelada");

  // Inserta la próxima cita en el panel principal del dashboard.
  const nextElement = document.getElementById("nextAppointment");
  if (next) {
    nextElement.innerHTML = `<div style="display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1rem;"><div><strong>${SAL.escapeHtml(next.doctor)}</strong><p class="text-muted">${SAL.escapeHtml(next.specialty)}</p></div><span class="badge-status ${next.status === "Pendiente" ? "badge-pendiente" : "badge-confirmada"}">${SAL.escapeHtml(next.status)}</span></div><div class="notice"><strong>${SAL.escapeHtml(next.date)}</strong> · ${SAL.escapeHtml(next.time)} · ${SAL.escapeHtml(next.location)}</div><button class="btn btn-danger js-cancel-dashboard" data-id="${next.id}">Cancelar cita</button>`;

    // Permite cancelar la próxima cita desde el dashboard.
    nextElement.querySelector(".js-cancel-dashboard").addEventListener("click", () => {
      if (!confirm("¿Cancelar esta cita?")) return;
      SAL.saveAppointments(SAL.getAppointments().map((item) => item.id === next.id ? { ...item, status: "Cancelada" } : item));
      window.location.reload();
    });
  }

  // Muestra las citas más recientes en una tabla de actividad.
  const recent = document.getElementById("recentAppointments");
  recent.innerHTML = sorted.slice(0, 5).map((item) => `<tr><td>${SAL.escapeHtml(item.specialty)}</td><td>${SAL.escapeHtml(item.date)} · ${SAL.escapeHtml(item.time)}</td><td><span class="badge-status ${item.status === "Cancelada" ? "badge-cancelada" : item.status === "Pendiente" ? "badge-pendiente" : "badge-confirmada"}">${SAL.escapeHtml(item.status)}</span></td></tr>`).join("") || '<tr><td colspan="3" class="empty-state">Sin actividad todavía.</td></tr>';
}());
