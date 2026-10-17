require('dotenv').config(); 

const app = require('./app'); // Importa la aplicación desde app.js
const pool = require('./config/database'); // Importa la configuración de la base de datos

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await pool.query('SELECT 1');

        console.log('MySQL connected successfully');

        app.listen(PORT, () => {
            console.log(`SAL API running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MySQL:', error.message);
    }
}

startServer();