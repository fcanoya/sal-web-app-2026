(function () {
  // Se obtienen los elementos de la tabla y del buscador para manipular la interfaz.
  const tbody = document.getElementById("userTableBody");
  const searchInput = document.getElementById("userSearch");

  // Si no existe la tabla, se sale para evitar errores en páginas donde no se usa este script.
  if (!tbody) return;

  // Funciones rápidas para leer y guardar usuarios desde localStorage.
  const get = () => SAL.getUsers();
  const save = (users) => SAL.write(SAL.USER_KEY, users);

  // Guarda el índice del usuario que se está editando para poder actualizarlo después.
  let editIndex = -1;

  // Valida que los datos del usuario sean correctos y que no haya duplicados.
  const valid = (user, users, index) => {
    if (!/^[\p{L} ]{2,50}$/u.test(user.nombre) || !/^[\p{L} ]{2,50}$/u.test(user.apellido)) return "Nombre y apellido inválidos.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.correo)) return "Correo inválido.";
    if (!/^\d{6,12}$/.test(user.cedula) || !/^\d{10}$/.test(user.telefono)) return "Cédula o teléfono inválido.";
    return users.some((item, i) => i !== index && (item.correo.toLowerCase() === user.correo || item.cedula === user.cedula || item.telefono === user.telefono)) ? "El correo, la cédula o el teléfono ya están registrados." : "";
  };

  // Comprueba si un usuario coincide con lo escrito en el buscador.
  function matchesQuery(user, query) {
    if (!query) return true;

    const values = [
      user.nombre,
      user.apellido,
      `${user.nombre} ${user.apellido}`,
      user.correo,
      user.cedula,
      user.telefono
    ];

    return values.some((value) => String(value ?? "").toLowerCase().includes(query));
  }

  // Renderiza la tabla con los usuarios actuales o filtrados por búsqueda.
  function render() {
    const users = get();
    const query = (searchInput ? searchInput.value.trim().toLowerCase() : "");
    const filteredUsers = users.map((user, index) => ({ user, index })).filter(({ user }) => matchesQuery(user, query));

    tbody.innerHTML = filteredUsers.length
      ? filteredUsers.map(({ user, index }) => `<tr><td>${SAL.escapeHtml(user.cedula)}</td><td>${SAL.escapeHtml(`${user.nombre} ${user.apellido}`)}</td><td>${SAL.escapeHtml(user.correo)}</td><td>${SAL.escapeHtml(user.telefono)}</td><td class="table-actions"><button class="btn btn-small" data-action="edit" data-index="${index}">Editar</button><button class="btn btn-danger btn-small" data-action="delete" data-index="${index}">Eliminar</button></td></tr>`).join("")
      : `<tr><td colspan="5" class="empty-state">${users.length ? "No hay usuarios que coincidan con la búsqueda." : "No hay usuarios registrados."}</td></tr>`;
  }

  // Abre el modal de edición y llena los campos con los datos del usuario seleccionado.
  function openModal(index) {
    const user = get()[index]; if (!user) return;
    editIndex = index;

    ["Nombre", "Apellido", "Correo", "Cedula", "Telefono"].forEach((name) => {
      document.getElementById(`edit${name}`).value = user[name.toLowerCase() === "correo" ? "correo" : name.toLowerCase()];
    });

    document.getElementById("editError").textContent = "";
    document.getElementById("editModal").hidden = false;
  }

  // Cierra el modal de edición.
  function closeModal() { document.getElementById("editModal").hidden = true; }

  // Escucha clics dentro de la tabla para decidir si se edita o elimina un usuario.
  tbody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]"); if (!button) return;
    const index = Number(button.dataset.index);
    const users = get();

    if (button.dataset.action === "edit") openModal(index);

    if (button.dataset.action === "delete" && confirm("¿Deseas eliminar este usuario?")) {
      users.splice(index, 1);
      save(users);
      render();
    }
  });

  // Cuando se envia el formulario de edición, valida los cambios y guarda el usuario actualizado.
  document.getElementById("editForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const users = get();
    const updated = {
      ...users[editIndex],
      nombre: document.getElementById("editNombre").value.trim(),
      apellido: document.getElementById("editApellido").value.trim(),
      correo: document.getElementById("editCorreo").value.trim().toLowerCase(),
      cedula: document.getElementById("editCedula").value.trim(),
      telefono: document.getElementById("editTelefono").value.trim()
    };

    const error = valid(updated, users, editIndex);
    document.getElementById("editError").textContent = error;

    if (error) return;

    users[editIndex] = updated;
    save(users);
    closeModal();
    render();
  });

  // Cierra los modales al presionar X o cancelar.
  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("cancelEdit").addEventListener("click", closeModal);

  // Cada vez que el usuario escribe en el buscador, vuelve a dibujar la tabla con resultados filtrados.
  if (searchInput) searchInput.addEventListener("input", render);

  // Dibuja la tabla inicial al cargar la página.
  render();
}());
