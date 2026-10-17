# Sistema de Agendamiento en Línea (SAL)

SAL es un proyecto web para explorar la gestión de citas médicas. El repositorio contiene un frontend multipágina en español y un backend REST en desarrollo.

> **Estado:** el frontend y la API todavía funcionan de forma independiente. El frontend guarda sus datos en el navegador y no consume la API. No uses esta demostración para almacenar información real de pacientes.

## Funcionalidades

### Aplicación web

- Registro e inicio de sesión de demostración.
- Agenda y consulta de citas, con opciones para filtrar y cancelar.
- Vistas de historial, especialidades, usuarios, reportes y panel principal.
- Formulario de soporte y diseño adaptable a dispositivos móviles.
- Usuarios de prueba cargados automáticamente cuando no hay usuarios en el navegador:
  - `laura.martinez@sal.com`
  - `carlos.rodriguez@sal.com`
  - `mariana.gomez@sal.com`
  - Contraseña para las tres cuentas: `SAL123`

### API

- Comprobación de estado en `GET /api/health`.
- Operaciones para crear, listar, consultar, actualizar, cambiar el estado y eliminar lógicamente usuarios.
- Validación de los datos de entrada y contraseñas cifradas con `bcrypt`.
- Conexión a MySQL mediante un pool de `mysql2`.

## Tecnologías

- **Frontend:** HTML, CSS y JavaScript nativos; no requiere paquetes ni compilación.
- **Backend:** Node.js, Express, MySQL, `mysql2`, `dotenv` y `bcrypt`.

## Requisitos

- Navegador moderno.
- Python 3 o una extensión de servidor estático, como Live Server, para servir el frontend.
- Para ejecutar la API: Node.js 18 o superior, npm y MySQL Server.

## Ejecutar el frontend

Desde la carpeta raíz, inicia un servidor estático:

```bash
python -m http.server 8000
```

Abre [http://localhost:8000/sal-frontend/](http://localhost:8000/sal-frontend/) en el navegador. También puedes abrir `sal-frontend/index.html` directamente, aunque algunas funciones del navegador pueden requerir un servidor local.

Los datos de prueba se guardan en `localStorage` y solo están disponibles en el mismo navegador y origen. Para reiniciar la demostración, borra los datos del sitio desde las herramientas de almacenamiento del navegador.

## Ejecutar el backend

1. Entra a la carpeta del backend e instala sus dependencias:

   ```bash
   cd sal-backend
   npm install
   ```

2. Copia `.env.example` a `.env` y configura la conexión:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=sal-db
   DB_PORT=3306
   ```

   En Windows puedes copiar el archivo con `Copy-Item .env.example .env` desde PowerShell; en macOS o Linux, usa `cp .env.example .env`.

3. Crea la base de datos y las tablas antes de iniciar el servidor. El repositorio no incluye migraciones ni un script SQL. La API de usuarios espera las tablas `usuario` y `rol`, con las columnas referenciadas por las consultas en `sal-backend/src/modules/users/user.repository.js`.

4. Inicia el servidor:

   ```bash
   npm run dev
   ```

   Para iniciarlo sin reinicio automático, usa `npm start`. La API se inicia en el puerto definido por `PORT` (3000 por defecto) y requiere una conexión MySQL disponible.

## Endpoints disponibles

La base de la API es `http://localhost:3000`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/health` | Comprueba que la API responde. |
| `POST` | `/api/users` | Crea un usuario. |
| `GET` | `/api/users` | Lista los usuarios no eliminados. |
| `GET` | `/api/users/:id` | Consulta un usuario por ID. |
| `PUT` | `/api/users/:id` | Actualiza nombre, correo y rol. |
| `PATCH` | `/api/users/:id/status` | Cambia el estado a `0` o `1`. |
| `DELETE` | `/api/users/:id` | Realiza una eliminación lógica. |

El cuerpo para crear un usuario es JSON:

```json
{
  "nombre": "Ana Pérez",
  "correo": "ana@example.com",
  "contrasena": "una-clave-segura",
  "id_rol": 1
}
```

Para actualizarlo, envía `nombre`, `correo` e `id_rol`; para cambiar el estado, envía `{"estado": 1}` o `{"estado": 0}`. Los IDs de rol deben existir en la tabla `rol`.

## Estructura del repositorio

```text
sal-web-app-2026/
├── sal-backend/
│   ├── src/
│   │   ├── config/             # Conexión a MySQL
│   │   ├── middlewares/        # Manejo centralizado de errores
│   │   ├── modules/users/      # Rutas, controlador, servicio y repositorio
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── sal-frontend/
│   ├── assets/                 # Estilos
│   ├── pages/                  # Vistas de la aplicación
│   ├── public/                 # Imágenes y logotipos
│   ├── scripts/                # Lógica de interfaz y persistencia local
│   └── index.html
└── README.md
```

## Seguridad y limitaciones

El inicio de sesión del frontend es solo una demostración: sus usuarios y contraseñas se almacenan en texto legible en `localStorage`, sin autenticación ni autorización del lado del servidor. La API cifra las contraseñas que recibe al crear usuarios, pero todavía no implementa inicio de sesión, tokens, control de acceso ni integración con el frontend. No se deben introducir datos personales o clínicos reales.

El frontend tampoco envía citas ni mensajes de soporte a un servidor. Los datos quedan limitados al almacenamiento local del navegador.

## Autoría

Francisco Cano Yanez.
