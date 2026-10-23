require('dotenv').config(); 

const app = require('./app'); // Importa la aplicación desde app.js
const pool = require('./config/database'); // Importa la configuración de la base de datos

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 ||
            process.env.JWT_SECRET.startsWith("replace_with_")) {
            throw new Error('JWT_SECRET must contain at least 32 characters');
        }
        await pool.query('SELECT 1');

        console.log('MySQL connected successfully');

        app.listen(PORT, () => {
            console.log(`SAL API running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exitCode = 1;
    }
}

startServer();