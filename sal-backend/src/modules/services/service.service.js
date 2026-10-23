const repository = require("./service.repository");
const httpError = require("../../utils/httpError");

function validate(data) {
    if (typeof data.descripcion_servicio !== "string" ||
        !data.descripcion_servicio.trim() || data.descripcion_servicio.length > 150 ||
        typeof data.costo_servicio !== "number" ||
        !Number.isFinite(data.costo_servicio) ||
        data.costo_servicio < 0 || data.costo_servicio > 99999999.99 ||
        Number(data.costo_servicio.toFixed(2)) !== data.costo_servicio ||
        (data.estado !== undefined && !["Activo", "Inactivo"].includes(data.estado))) {
        throw httpError("Description, a non-negative cost, and a valid status are required", 400);
    }
}

async function getById(id) {
    const service = await repository.findById(id);
    if (!service) throw httpError("Service not found", 404);
    return service;
}

async function create(data) {
    validate(data);
    const id = await repository.create({
        ...data,
        descripcion_servicio: data.descripcion_servicio.trim(),
        costo_servicio: data.costo_servicio
    });
    return getById(id);
}

async function update(id, data) {
    validate(data);
    if (!["Activo", "Inactivo"].includes(data.estado)) {
        throw httpError("A valid service status is required", 400);
    }
    await getById(id);
    await repository.update(id, {
        ...data,
        descripcion_servicio: data.descripcion_servicio.trim(),
        costo_servicio: data.costo_servicio,
        estado: data.estado
    });
    return getById(id);
}

module.exports = { getById, create, update };
