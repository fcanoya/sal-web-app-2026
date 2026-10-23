require("dotenv").config();
const readline = require("node:readline");
const bcrypt = require("bcrypt");
const pool = require("../src/config/database");

function question(prompt) {
    const input = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => input.question(prompt, (answer) => {
        input.close();
        resolve(answer.trim());
    }));
}

function secret(prompt) {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
        return Promise.reject(new Error("Run this command in an interactive terminal"));
    }
    return new Promise((resolve, reject) => {
        process.stdout.write(prompt);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        let value = "";
        const finish = (error) => {
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener("data", onData);
            process.stdout.write("\n");
            if (error) reject(error);
            else resolve(value);
        };
        const onData = (buffer) => {
            for (const character of buffer.toString("utf8")) {
                if (character === "\u0003") {
                    finish(new Error("Admin creation cancelled"));
                    return;
                }
                if (character === "\r" || character === "\n") {
                    finish();
                    return;
                }
                if (character === "\u007f" || character === "\b") {
                    value = value.slice(0, -1);
                    continue;
                }
                if (character >= " ") {
                    value += character;
                    process.stdout.write("*");
                }
            }
        };
        process.stdin.on("data", onData);
    });
}

async function main() {
    const name = await question("Admin name: ");
    const email = (await question("Admin email: ")).toLowerCase();
    const password = await secret("Admin password (minimum 12 characters): ");
    if (name.length < 2 || name.length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150 ||
        password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
        throw new Error("Provide a valid name, email, and password of at least 12 characters");
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [roles] = await pool.execute(
        "SELECT id_rol FROM rol WHERE nombre = 'SYSTEM_ADMIN' LIMIT 1"
    );
    if (!roles[0]) throw new Error("SYSTEM_ADMIN role is missing; apply database/schema.sql first");
    const [result] = await pool.execute(
        `INSERT INTO usuario (nombre, correo, contrasena, id_rol_fk)
         VALUES (?, ?, ?, ?)`,
        [name, email, passwordHash, roles[0].id_rol]
    );
    console.log(`Created SYSTEM_ADMIN user ${result.insertId}`);
}

main()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
