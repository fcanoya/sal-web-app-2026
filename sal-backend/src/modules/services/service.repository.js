const pool = require("../../config/database");

async function list(availableOnly = false) {
    const query = `SELECT id_servicio, descripcion_servicio, costo_servicio, estado
                   FROM servicio ${availableOnly ? "WHERE estado = 'Activo'" : ""}
                   ORDER BY descripcion_servicio`;
    const [rows] = await pool.execute(query);
    return rows;
}

async function findById(id) {
    const [rows] = await pool.execute(
        `SELECT id_servicio, descripcion_servicio, costo_servicio, estado
         FROM servicio WHERE id_servicio = ?`,
        [id]
    );
    return rows[0];
}

async function create(data) {
    const [result] = await pool.execute(
        `INSERT INTO servicio (descripcion_servicio, costo_servicio, estado)
         VALUES (?, ?, ?)`,
        [data.descripcion_servicio, data.costo_servicio, data.estado || "Activo"]
    );
    return result.insertId;
}

async function update(id, data) {
    const [result] = await pool.execute(
        `UPDATE servicio
         SET descripcion_servicio = ?, costo_servicio = ?, estado = ?
         WHERE id_servicio = ?`,
        [data.descripcion_servicio, data.costo_servicio, data.estado, id]
    );
    return result.affectedRows;
}

module.exports = { list, findById, create, update };
