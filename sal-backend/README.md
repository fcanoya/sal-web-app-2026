# SAL Backend

Backend del proyecto SAL (Sistema de Agendamiento en Línea), desarrollado con Node.js, Express y MySQL. Este servicio está pensado como la capa de API para la aplicación web de citas médicas y sirve como base para futuras funcionalidades de autenticación, gestión de usuarios, citas, historial, reportes y soporte.

## Descripción general

El backend de SAL proporciona una API REST para gestionar la lógica de negocio de la aplicación. Actualmente incluye una verificación del estado del servidor y la base de datos, además de una estructura modular que permite ampliar el sistema con nuevos módulos, como usuarios, citas, especialidades y reportes.

## Tecnologías utilizadas

- Node.js
- Express.js
- MySQL
- mysql2
- dotenv
- Nodemon

## Requisitos previos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- Node.js 18 o superior
- npm
- MySQL Server
- Git

## Instalación

1. Abre una terminal en la carpeta del backend:

```bash
cd sal-backend
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

4. Configura las variables de entorno en `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=sal-db
DB_PORT=3306
```

> Asegúrate de que la base de datos MySQL exista y que el usuario tenga permisos para acceder a ella.

## Ejecución

Para iniciar el servidor en modo normal:

```bash
npm start
```

Para iniciar el servidor en modo desarrollo con reinicio automático:

```bash
npm run dev
```

## Verificación de salud

El backend expone un endpoint de prueba para comprobar que el servidor está activo:

```http
GET /api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "message": "SAL API is running"
}
```

## Estructura del proyecto

```text
sal-backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── modules/
│   │   └── users/
│   │       ├── user.controller.js
│   │       ├── user.repository.js
│   │       ├── user.routes.js
│   │       ├── user.service.js
│   │       └── user.validator.js
│   ├── app.js
│   └── server.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Estado del proyecto

Este backend se encuentra en una etapa inicial de desarrollo. Actualmente cuenta con:

- Configuración de Express
- Conexión a MySQL con `mysql2`
- Endpoint `/api/health` funcional
- Estructura modular lista para extenderse

Todavía se encuentran pendientes:

- Autenticación de usuarios
- CRUD de citas y pacientes
- Validaciones y manejo de errores
- Seguridad con JWT / sesiones
- Protección de rutas
- Manejo de roles y permisos
- Base de datos con modelos y migraciones

## Buenas prácticas recomendadas

- Mantener la lógica de negocio en servicios
- Separar controladores, repositorios y validadores por módulo
- Usar variables de entorno para credenciales y configuración
- Validar entradas del usuario antes de ejecutar consultas
- Manejar errores de forma centralizada
- Crear pruebas automáticas para cada módulo

## Autor

Francisco Cano Yanez
