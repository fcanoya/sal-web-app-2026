# Sistema SAL

Sistema de Agendamiento en Linea - SAL, es un prototipo web en español para explorar la gestión de citas médicas. Incluye páginas públicas y vistas para registro, inicio de sesión, agenda, citas, historial, especialidades, usuarios, reportes, soporte y panel principal.

## Estado del proyecto

La aplicación implementada es una demostración de frontend: funciona en el navegador y conserva sus datos en el almacenamiento local de ese navegador. No hay una API ni persistencia compartida entre dispositivos. Las carpetas `src/controllers`, `src/models`, `src/routes` y `src/services` están preparadas como estructura, pero todavía no contienen un backend funcional. `package.json` y `server.js` están vacíos, por lo que no hay comandos npm ni servidor de aplicación configurados.

## Decisiones técnicas

- **HTML, CSS y JavaScript nativos:** las vistas son documentos HTML independientes en `pages/`; no se utiliza un framework ni un proceso de compilación.
- **Diseño multipágina:** `index.html` es la portada y cada flujo tiene su propia página. Los scripts específicos de `scripts/` se cargan desde las vistas que los necesitan.
- **Estilos compartidos por capas:** `assets/css/main.css` importa tokens, reset, layout, componentes y utilidades responsive. Los valores visuales reutilizables se definen en `assets/css/settings/tokens.css`.
- **Servicios compartidos en el navegador:** `scripts/app.js` expone `window.SAL`, que centraliza el acceso a usuarios, sesión, citas y mensajes de soporte, así como utilidades comunes.
- **Persistencia local para la demostración:** los datos se serializan como JSON en `localStorage`. Las claves principales son `usuarios`, `sal_sesion`, `sal_citas` y `sal_soporte`.
- **Sin dependencias externas declaradas:** el proyecto no requiere instalación de paquetes para su frontend actual.

## Funcionalidades presentes

- Registro e inicio de sesión de demostración.
- Agenda de citas con selección de especialidad, profesional, fecha y hora.
- Consulta, filtrado, cancelación y eliminación de citas del historial.
- Formularios y preguntas frecuentes de soporte.
- Interfaz responsive y menú móvil.

Los datos iniciales de prueba se crean desde `scripts/app.js` cuando no hay usuarios guardados. Las credenciales de demostración son `laura.martinez@sal.com`, `carlos.rodriguez@sal.com` o `mariana.gomez@sal.com`, con la contraseña `SAL123`.

## Instalación

No se requiere instalar dependencias para ejecutar el frontend: el proyecto no tiene paquetes declarados ni un proceso de compilación.

1. Descarga o clona el proyecto y abre la carpeta raíz en Visual Studio Code.
2. Sirve la carpeta raíz con una herramienta de servidor estático, por ejemplo, la extensión Live Server. También puedes abrir `index.html` directamente en un navegador.
3. Si tienes Python instalado, como alternativa puedes abrir una terminal en la carpeta raíz y ejecutar:

	```bash
	python -m http.server 8000
	```

4. Con el servidor de Python, visita `http://localhost:8000`.

No están configurados `npm install`, `npm start` ni un servidor Node. El estado de prueba se conserva por navegador y origen. Para reiniciar la demostración, borra los datos del sitio desde las herramientas de almacenamiento del navegador.

## Uso

1. En la portada, selecciona **Registrarse** para crear una cuenta de prueba o **Iniciar sesión** para usar una cuenta existente.
2. Para probar el inicio de sesión, usa `laura.martinez@sal.com`, `carlos.rodriguez@sal.com` o `mariana.gomez@sal.com`; la contraseña para las tres cuentas es `SAL123`.
3. En **Agendar cita**, completa especialidad, profesional, fecha y hora. Después podrás consultar, filtrar o cancelar la cita desde **Mis citas**.
4. En **Soporte**, puedes probar el formulario y las preguntas frecuentes. El envío solo conserva el mensaje en el `localStorage` del navegador; no contacta al equipo de soporte.

También puedes inspeccionar los datos desde la consola del navegador, después de abrir una página de SAL:

```js
// Consultar los usuarios y las citas guardados en este navegador.
SAL.getUsers();
SAL.getAppointments();

// Consultar la sesión activa; devuelve null si no hay una sesión.
SAL.getCurrentUser();
```

Las funciones anteriores forman parte de `window.SAL`, definida en `scripts/app.js`. Los cambios solo afectan al almacenamiento local del navegador actual.

## Seguridad y alcance

Este proyecto no debe utilizarse para gestionar información real de pacientes. Las contraseñas y los demás datos se guardan en texto legible en `localStorage`; la autenticación solo valida información en el cliente y no hay controles de acceso del lado del servidor. Esto no equivale a cifrado, autenticación segura ni protección de datos clínicos.

Los textos de la interfaz que mencionan confirmaciones, recordatorios, SSL/TLS o protección frente a ataques describen objetivos del producto, no servicios implementados por el prototipo. No hay integración de correo/SMS ni configuración de HTTPS en el código actual.

## Estructura principal

```text
assets/css/     Estilos, tokens, layout y utilidades
components/     Estilos de componentes reutilizables
pages/          Vistas HTML de la aplicación
scripts/        Lógica de frontend y persistencia local
public/         Imágenes, iconos y logotipos
src/            Estructura reservada para una futura capa de servidor
index.html      Página de inicio
```

## Evolución prevista

Para pasar del prototipo a un sistema utilizable se debe implementar una API y una base de datos, mover autenticación y validaciones al servidor, proteger los datos personales, configurar HTTPS y conectar los canales reales de notificación. La estructura bajo `src/` puede servir como punto de partida, pero esas decisiones aún están pendientes.

## Contacto y autoría

La página de soporte muestra los siguientes datos de demostración: `soporte@sistemasal.co`, `+57 (1) 800-SAL-9999` y atención de lunes a viernes, de 7:00 a 19:00. Deben confirmarse antes de utilizarlos como canales oficiales. El formulario de soporte no envía correos ni transmite los mensajes fuera del navegador.

Autor responsable del proyecto: Francisco Cano Yanez.
