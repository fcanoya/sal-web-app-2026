const mysql = require('mysql2/promise'); // Importamos el paquete mysql2/promise para poder usar promesas con MySQL

// Creamos un pool de conexiones a la base de datos MySQL usando las variables de entorno definidas en el archivo .env
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

module.exports = pool; // Exportamos el pool de conexiones para poder usarlo en otros archivos del proyecto
