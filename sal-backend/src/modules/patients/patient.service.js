const repository = require("./patient.repository");
const httpError = require("../../utils/httpError");
const { isValidDate } = require("../../utils/date");

async function getOwn(userId) {
    const patient = await repository.findByUserId(userId);
    if (!patient) throw httpError("Patient profile not found", 404);
    return patient;
}

async function getById(id) {
    const patient = await repository.findById(id);
    if (!patient) throw httpError("Patient not found", 404);
    return patient;
}

async function update(patient, data) {
    if (typeof data.nombre !== "string" || data.nombre.trim().length < 2 ||
        data.nombre.trim().length > 100 ||
        typeof data.correo !== "string" || data.correo.trim().length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo.trim())) {
        throw httpError("A valid name and email are required", 400);
    }
    if (data.tipo_afiliacion !== undefined && data.tipo_afiliacion !== null &&
        !["Contributivo", "Subsidiado", "Particular"].includes(data.tipo_afiliacion)) {
        throw httpError("Invalid affiliation type", 400);
    }
    if (data.genero !== undefined && data.genero !== null &&
        !["M", "F", "Otro"].includes(data.genero)) {
        throw httpError("Invalid gender", 400);
    }
    if (data.direccion !== undefined && data.direccion !== null &&
        (typeof data.direccion !== "string" || data.direccion.length > 150)) {
        throw httpError("Address must contain at most 150 characters", 400);
    }
    if (data.fecha_nacimiento !== undefined && data.fecha_nacimiento !== null &&
        !isValidDate(data.fecha_nacimiento)) {
        throw httpError("Birth date must use YYYY-MM-DD", 400);
    }
    if (data.fecha_nacimiento && data.fecha_nacimiento > new Date().toISOString().slice(0, 10)) {
        throw httpError("Birth date must not be in the future", 400);
    }
    data.nombre = data.nombre.trim();
    data.correo = data.correo.trim().toLowerCase();
    await repository.update(patient, data);
    return repository.findById(patient.id_paciente);
}

async function updateStatus(id, status) {
    if (status !== 0 && status !== 1) throw httpError("Status must be 0 or 1", 400);
    const changed = await repository.updateStatus(id, status);
    if (!changed) throw httpError("Patient not found", 404);
    return getById(id);
}

async function getHistory(id) {
    await getById(id);
    return repository.getAppointments(id);
}

module.exports = { getOwn, getById, update, updateStatus, getHistory };
