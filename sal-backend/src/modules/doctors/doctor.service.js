const bcrypt = require("bcrypt");
const repository = require("./doctor.repository");
const httpError = require("../../utils/httpError");
const { isValidDate } = require("../../utils/date");

function validTime(time) {
    return typeof time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

async function getById(id) {
    const doctor = await repository.findById(id);
    if (!doctor) throw httpError("Doctor not found", 404);
    return doctor;
}

async function add(data) {
    if (typeof data.nombre !== "string" || data.nombre.trim().length < 2 ||
        data.nombre.trim().length > 100 ||
        typeof data.correo !== "string" ||
        data.correo.trim().length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo.trim()) ||
        typeof data.contrasena !== "string" || data.contrasena.length < 8 ||
        Buffer.byteLength(data.contrasena, "utf8") > 72 ||
        typeof data.numero_licencia !== "string" || !data.numero_licencia.trim() ||
        data.numero_licencia.trim().length > 50 ||
        typeof data.especialidad !== "string" || !data.especialidad.trim() ||
        data.especialidad.trim().length > 100) {
        throw httpError("All doctor fields are required", 400);
    }
    const password = await bcrypt.hash(data.contrasena, 10);
    const id = await repository.addDoctor({
        ...data,
        nombre: data.nombre.trim(),
        correo: data.correo.trim().toLowerCase(),
        contrasena: password
    });
    return getById(id);
}

async function update(id, data) {
    await getById(id);
    if (typeof data.nombre !== "string" || data.nombre.trim().length < 2 ||
        data.nombre.trim().length > 100 ||
        typeof data.correo !== "string" ||
        data.correo.trim().length > 150 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo.trim()) ||
        typeof data.numero_licencia !== "string" || !data.numero_licencia.trim() ||
        data.numero_licencia.trim().length > 50 ||
        typeof data.especialidad !== "string" || !data.especialidad.trim() ||
        data.especialidad.trim().length > 100) {
        throw httpError("All doctor fields are required", 400);
    }
    await repository.update(id, {
        ...data,
        nombre: data.nombre.trim(),
        correo: data.correo.trim().toLowerCase(),
        numero_licencia: data.numero_licencia.trim(),
        especialidad: data.especialidad.trim()
    });
    return getById(id);
}

async function addSchedule(id, data) {
    await getById(id);
    const weekday = Number(data.dia_semana);
    if (!Number.isInteger(data.dia_semana) || weekday < 0 || weekday > 6 ||
        !validTime(data.hora_inicio) || !validTime(data.hora_fin) ||
        data.hora_inicio >= data.hora_fin ||
        !["00", "30"].includes(data.hora_inicio.slice(3)) ||
        !["00", "30"].includes(data.hora_fin.slice(3))) {
        throw httpError("Schedule must use weekday 0-6 and valid increasing times", 400);
    }
    const scheduleId = await repository.addSchedule(
        id, weekday, data.hora_inicio, data.hora_fin
    );
    return { id_disponibilidad: scheduleId, ...data, dia_semana: weekday };
}

async function availableSlots(id, date) {
    const doctor = await getById(id);
    if (!isValidDate(date)) {
        throw httpError("A valid date in YYYY-MM-DD format is required", 400);
    }
    if (date < new Date().toISOString().slice(0, 10)) return [];
    if (!doctor.estado) return [];
    const weekday = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
    const slots = await repository.availableSlots(id, date, weekday);
    if (date !== new Date().toISOString().slice(0, 10)) return slots;
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return slots.filter((slot) => slot > currentTime);
}

module.exports = { getById, add, update, addSchedule, availableSlots, validTime };
