# Sistema de Agendamiento en Línea (SAL)

SAL es un proyecto web para explorar la gestión de citas médicas. El repositorio contiene un frontend multipágina en español y una API REST construida con Node.js, Express y MySQL.

> **Estado:** el frontend y la API todavía funcionan de forma independiente. El frontend guarda sus datos en el navegador y no consume la API. La API cubre autenticación, pacientes, doctores, servicios, citas, notificaciones en cola, reportes y administración. No uses este prototipo para almacenar información clínica real.

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
- Registro de pacientes e inicio de sesión con JWT; las rutas privadas exigen autenticación y autorización por rol.
- Gestión de pacientes, doctores, disponibilidad semanal, servicios médicos y ciclo de vida de citas.
- Registro de cambios de estado, auditoría de operaciones y administración de configuración y roles.
- Reporte de citas en CSV y resumen de pacientes, citas y disponibilidad médica.
- Las notificaciones se guardan para consulta, pero no se envían por correo o SMS hasta configurar un proveedor.

## Tecnologías

- **Frontend:** HTML, CSS y JavaScript nativos; no requiere paquetes ni compilación.
- **Backend:** Node.js, Express, MySQL, `mysql2`, `dotenv`, `bcrypt` y `jsonwebtoken`.

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
   DB_NAME=sal_db
   DB_PORT=3306
   JWT_SECRET=
   JWT_EXPIRES_IN=2h
   ```

   Define `JWT_SECRET` con un valor aleatorio de al menos 32 caracteres; puedes generar uno con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. En Windows puedes copiar el archivo con `Copy-Item .env.example .env` desde PowerShell; en macOS o Linux, usa `cp .env.example .env`.

3. Crea el esquema y las tablas definidas por la API desde la carpeta `sal-backend`:

   ```powershell
   Get-Content .\database\schema.sql | mysql -u root -p
   ```

   El script crea la base `sal_db`, los roles iniciales y las tablas auxiliares. Si ya tienes las tablas base del esquema SAL, ejecuta también `database/migrations/001_allow_cancelled_slot_rebooking.sql` (solo si existe el índice `uq_cita_doctor`); haz un respaldo antes de aplicar cambios.

4. Crea el primer administrador desde una terminal interactiva. La contraseña se solicita sin mostrarla:

   ```bash
   npm run create-admin
   ```

5. Inicia el servidor:

   ```bash
   npm run dev
   ```

   Para iniciarlo sin reinicio automático, usa `npm start`. La API se inicia en el puerto definido por `PORT` (3000 por defecto) y requiere una conexión MySQL disponible.

## Endpoints principales

La base de la API es `http://localhost:3000`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Registra un paciente; el rol no se elige desde el cliente. |
| `POST` | `/api/auth/login` | Inicia sesión y entrega un JWT. |
| `GET/PUT` | `/api/patients/me` | Consulta o actualiza el perfil propio del paciente. |
| `GET` | `/api/patients/me/appointments` | Consulta el historial propio de citas. |
| `GET/POST/PUT` | `/api/doctors` | Consulta profesionales; la creación/actualización requiere administrador. |
| `GET/POST/DELETE` | `/api/doctors/:id/schedules` | Consulta y administra ventanas semanales de disponibilidad. |
| `GET` | `/api/doctors/:id/availability?date=YYYY-MM-DD` | Consulta los bloques disponibles de 30 minutos. |
| `GET/POST/PUT` | `/api/services` | Consulta servicios; la administración requiere rol `SYSTEM_ADMIN`. |
| `GET/POST` | `/api/appointments` | Consulta citas autorizadas o agenda una cita como paciente/administrador. |
| `PATCH` | `/api/appointments/:id/status` | Confirma, cancela o completa una cita según rol y estado actual. |
| `GET/PATCH` | `/api/notifications` | Consulta notificaciones propias y marca una como leída. |
| `GET` | `/api/reports/summary` | Resume citas, pacientes y disponibilidad para un rango de fechas. |
| `GET` | `/api/reports/appointments.csv` | Exporta citas a CSV para un rango de fechas. |
| `GET/PUT` | `/api/admin/configuration` | Consulta y actualiza claves de configuración permitidas. |
| `GET/PATCH` | `/api/admin/roles`, `/api/admin/users/:id/role` | Consulta roles y asigna un rol a un usuario. |
| `GET` | `/api/admin/audit` | Consulta eventos auditados. |
| `GET` | `/api/health` | Comprueba la API y la conexión a MySQL. |

Envía el token como `Authorization: Bearer <token>`. Los roles `SYSTEM_ADMIN`, `DOCTOR` y `PACIENTE` son los roles de la aplicación; el registro público crea exclusivamente pacientes y los doctores se crean desde la API administrativa. Para agendar, envía JSON:

```json
{
  "id_doctor": 1,
  "id_servicios": [1],
  "fecha_cita": "2026-12-01",
  "hora_cita": "09:30",
  "motivo_consulta": "Consulta general"
}
```

Los horarios se guardan como ventanas semanales, de lunes (`0`) a domingo (`6`), y se dividen en citas fijas de 30 minutos. Para agendar como administrador, incluye también `id_paciente` en el JSON. Las notificaciones de eventos se registran con estado `SIN_PROVEEDOR`; no hay entrega automática ni recordatorios programados.

## Estructura del repositorio

```text
sal-web-app-2026/
├── sal-backend/
│   ├── src/
│   │   ├── config/             # Conexión a MySQL
│   │   ├── middlewares/        # Autenticación, roles, auditoría y errores
│   │   ├── modules/            # auth, users, patients, doctors, services,
│   │   │                      # appointments, notifications, reports y admin
│   │   ├── app.js
│   │   └── server.js
│   ├── database/schema.sql     # Esquema y roles iniciales
│   ├── scripts/create-admin.js # Alta interactiva del primer administrador
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

El inicio de sesión del frontend es solo una demostración: sus usuarios y contraseñas se almacenan en texto legible en `localStorage`, sin autenticación ni autorización del lado del servidor. La API protege contraseñas con `bcrypt`, firma JWT y aplica permisos por rol, pero todavía no está conectada al frontend. No se deben introducir datos personales o clínicos reales.

Las notificaciones de la API solo se almacenan; para correo/SMS y recordatorios automáticos aún se requiere configurar un proveedor y un proceso de entrega. El frontend tampoco envía citas ni mensajes de soporte a un servidor; esos datos quedan limitados al almacenamiento local del navegador. Antes de desplegar se deben configurar HTTPS, protección contra intentos automatizados de acceso y las políticas legales de tratamiento de datos de salud.

## Autoría

Francisco Cano Yanez.
