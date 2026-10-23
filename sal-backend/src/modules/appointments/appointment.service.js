const repository = require("./appointment.repository");
const httpError = require("../../utils/httpError");
const { isValidDate } = require("../../utils/date");

function publicAppointment(appointment) {
    if (!appointment) return appointment;
    const { patient_user_id, doctor_user_id, ...data } = appointment;
    return data;
}

function dateWeekday(date) {
    if (!isValidDate(date)) return null;
    return (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
}

async function create(user, body) {
    const weekday = dateWeekday(body.fecha_cita);
    if (weekday === null || typeof body.hora_cita !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.hora_cita) ||
        !["00", "30"].includes(body.hora_cita.slice(3)) ||
        !Number.isInteger(body.id_doctor) ||
        !Array.isArray(body.id_servicios) || body.id_servicios.length === 0 ||
        body.id_servicios.length > 10 ||
        body.id_servicios.some((id) => !Number.isInteger(id) || id <= 0)) {
        throw httpError("Invalid appointment date, time, doctor, or services", 400);
    }
    if (body.id_paciente !== undefined &&
        (!Number.isInteger(body.id_paciente) || body.id_paciente <= 0)) {
        throw httpError("Invalid patient ID", 400);
    }
    if (!Number.isInteger(body.id_paciente) || body.id_paciente <= 0) {
        throw httpError("A patient ID is required", 400);
    }
    if (body.fecha_cita < new Date().toISOString().slice(0, 10)) {
        throw httpError("Appointment date must not be in the past", 400);
    }
    if (new Date(`${body.fecha_cita}T${body.hora_cita}:00`) <= new Date()) {
        throw httpError("Appointment time must be in the future", 400);
    }
    if (body.motivo_consulta !== undefined &&
        (typeof body.motivo_consulta !== "string" || body.motivo_consulta.length > 200)) {
        throw httpError("Reason must be a string of at most 200 characters", 400);
    }
    const serviceIds = [...new Set(body.id_servicios)];
    if (serviceIds.length !== body.id_servicios.length) {
        throw httpError("Duplicate services are not allowed", 400);
    }
    const data = {
        ...body,
        id_paciente: body.id_paciente,
        id_doctor: body.id_doctor,
        hora_cita: `${body.hora_cita}:00`,
        serviceIds,
        userId: user.id,
        actorRole: user.role,
        weekday
    };
    const appointmentId = await repository.create(data);
    return publicAppointment(await repository.findById(appointmentId));
}

async function changeStatus(user, id, status, message) {
    if (message !== undefined && message !== null &&
        (typeof message !== "string" || message.length > 250)) {
        throw httpError("Appointment notes must contain at most 250 characters", 400);
    }
    const appointment = await repository.findById(id);
    if (!appointment) throw httpError("Appointment not found", 404);
    if (user.role === "PACIENTE" &&
        (appointment.patient_user_id !== user.id || status !== "Cancelada")) {
        throw httpError("Patients may only cancel their own appointments", 403);
    }
    if (user.role === "DOCTOR" &&
        (appointment.doctor_user_id !== user.id ||
            !["Confirmada", "Completada", "Cancelada"].includes(status))) {
        throw httpError("Access denied", 403);
    }
    const allowed = {
        Pendiente: ["Confirmada", "Cancelada"],
        Confirmada: ["Cancelada", "Completada"],
        Cancelada: [],
        Completada: []
    };
    if (!allowed[appointment.estado_cita].includes(status)) {
        throw httpError("Invalid appointment status transition", 409);
    }
    await repository.updateStatus(id, status, user.id, message, appointment.estado_cita);
    return publicAppointment(await repository.findById(id));
}

async function getAccessible(user, id) {
    const appointment = await repository.findById(id);
    if (!appointment) throw httpError("Appointment not found", 404);
    if (user.role === "PACIENTE" && appointment.patient_user_id !== user.id) {
        throw httpError("Access denied", 403);
    }
    if (user.role === "DOCTOR" && appointment.doctor_user_id !== user.id) {
        throw httpError("Access denied", 403);
    }
    return appointment;
}

async function getById(user, id) {
    return publicAppointment(await getAccessible(user, id));
}

module.exports = { create, changeStatus, getAccessible, getById, dateWeekday };
