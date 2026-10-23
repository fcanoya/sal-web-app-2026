const express = require('express');
const pool = require("./config/database");

const userRoutes = require('./modules/users/user.routes');
const errorHandler = require('./middlewares/error.middleware');
const authRoutes = require("./modules/auth/auth.routes");
const patientRoutes = require("./modules/patients/patient.routes");
const doctorRoutes = require("./modules/doctors/doctor.routes");
const serviceRoutes = require("./modules/services/service.routes");
const appointmentRoutes = require("./modules/appointments/appointment.routes");
const notificationRoutes = require("./modules/notifications/notification.routes");
const reportRoutes = require("./modules/reports/report.routes");
const adminRoutes = require("./modules/admin/admin.routes");

const app = express();

app.use(express.json({ limit: "1mb" }));
// Comprobación del servidor
app.get('/api/health', async (req, res) => {
    await pool.query("SELECT 1");
    res.status(200).json({
        status: 'ok',
        message: 'SAL API is running',
        database: "connected"
    });
});
// Rutas de usuarios
app.use('/api/users', userRoutes); // Usa las rutas de usuarios

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

// Middleware global de errores
app.use(errorHandler);
module.exports = app;