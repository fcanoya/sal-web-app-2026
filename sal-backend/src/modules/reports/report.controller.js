const repository = require("./report.repository");
const httpError = require("../../utils/httpError");
const { isValidDate } = require("../../utils/date");

function dateRange(query) {
    const from = query.desde;
    const to = query.hasta;
    const valid = isValidDate;
    if (!valid(from) || !valid(to) || from > to) {
        throw httpError("Use a valid date range: desde and hasta (YYYY-MM-DD)", 400);
    }
    if ((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
        86400000 > 366) {
        throw httpError("Report date range cannot exceed 366 days", 400);
    }
    return [from, to];
}

function csvValue(value) {
    let text = value === null || value === undefined ? "" : String(value);
    if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
}

async function appointments(req, res) {
    const [from, to] = dateRange(req.query);
    const rows = await repository.appointmentRows(from, to);
    const columns = [
        "id_cita", "fecha_cita", "hora_cita", "estado_cita",
        "motivo_consulta", "id_paciente", "paciente", "id_doctor", "doctor", "especialidad"
    ];
    const csv = [
        columns.join(","),
        ...rows.map((row) => columns.map((column) => csvValue(row[column])).join(","))
    ].join("\r\n");
    res.set({
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="citas-${from}-${to}.csv"`,
        "Cache-Control": "no-store"
    });
    res.send(`\uFEFF${csv}`);
}

async function summary(req, res) {
    const [from, to] = dateRange(req.query);
    const [appointments, patients, doctors] = await Promise.all([
        repository.appointmentSummary(from, to),
        repository.patientCounts(),
        repository.doctorAvailability(from, to)
    ]);
    res.json({ data: { desde: from, hasta: to, appointments, patients, doctors } });
}

module.exports = { appointments, summary };
