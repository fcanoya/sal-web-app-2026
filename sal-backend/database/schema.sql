CREATE DATABASE IF NOT EXISTS sal_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE sal_db;

CREATE TABLE IF NOT EXISTS rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150)
);

INSERT IGNORE INTO rol (nombre, descripcion) VALUES
    ('SYSTEM_ADMIN', 'Administrador del sistema'),
    ('DOCTOR', 'Profesional de la salud'),
    ('PACIENTE', 'Usuario paciente'),
    ('HR_ANALYST', 'Analista de Recursos Humanos'),
    ('HR_DIRECTOR', 'Director de Recursos Humanos'),
    ('APPLICANT', 'Postulante');

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    id_rol_fk INT NOT NULL,
    estado TINYINT NOT NULL DEFAULT 1,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol_fk) REFERENCES rol(id_rol)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_usuario_estado (estado, deleted_at)
);

CREATE TABLE IF NOT EXISTS paciente (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_fk INT NOT NULL UNIQUE,
    tipo_afiliacion ENUM('Contributivo', 'Subsidiado', 'Particular') NULL,
    fecha_nacimiento DATE NULL,
    genero ENUM('M', 'F', 'Otro') NULL,
    direccion VARCHAR(150) NULL,
    CONSTRAINT fk_paciente_usuario FOREIGN KEY (id_usuario_fk) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor (
    id_doctor INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_fk INT NOT NULL UNIQUE,
    numero_licencia VARCHAR(50) NOT NULL UNIQUE,
    especialidad VARCHAR(100) NOT NULL,
    CONSTRAINT fk_doctor_usuario FOREIGN KEY (id_usuario_fk) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS servicio (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    descripcion_servicio VARCHAR(150) NOT NULL,
    costo_servicio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    CONSTRAINT chk_servicio_costo CHECK (costo_servicio >= 0)
);

CREATE TABLE IF NOT EXISTS doctor_disponibilidad (
    id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
    id_doctor_fk INT NOT NULL,
    dia_semana TINYINT NOT NULL COMMENT '0=lunes, 6=domingo',
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo TINYINT NOT NULL DEFAULT 1,
    CONSTRAINT fk_disponibilidad_doctor FOREIGN KEY (id_doctor_fk) REFERENCES doctor(id_doctor)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_disponibilidad_dia CHECK (dia_semana BETWEEN 0 AND 6),
    CONSTRAINT chk_disponibilidad_horas CHECK (hora_inicio < hora_fin),
    INDEX idx_disponibilidad_doctor_dia (id_doctor_fk, dia_semana, activo)
);

CREATE TABLE IF NOT EXISTS cita (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    motivo_consulta VARCHAR(200) NULL,
    estado_cita ENUM('Pendiente', 'Confirmada', 'Cancelada', 'Completada')
        NOT NULL DEFAULT 'Pendiente',
    observaciones VARCHAR(250) NULL,
    id_paciente_fk INT NOT NULL,
    id_doctor_fk INT NOT NULL,
    CONSTRAINT fk_cita_paciente FOREIGN KEY (id_paciente_fk) REFERENCES paciente(id_paciente)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cita_doctor FOREIGN KEY (id_doctor_fk) REFERENCES doctor(id_doctor)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_cita_doctor_fecha (id_doctor_fk, fecha_cita, estado_cita),
    INDEX idx_cita_paciente_fecha (id_paciente_fk, fecha_cita, estado_cita)
);

CREATE TABLE IF NOT EXISTS cita_servicio (
    id_cita_fk INT NOT NULL,
    id_servicio_fk INT NOT NULL,
    PRIMARY KEY (id_cita_fk, id_servicio_fk),
    CONSTRAINT fk_cita_servicio_cita FOREIGN KEY (id_cita_fk) REFERENCES cita(id_cita)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cita_servicio_servicio FOREIGN KEY (id_servicio_fk) REFERENCES servicio(id_servicio)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS historial_estado_cita (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_cita_fk INT NOT NULL,
    estado_cita ENUM('Pendiente', 'Confirmada', 'Cancelada', 'Completada') NOT NULL,
    id_usuario_fk INT NULL,
    observacion VARCHAR(250) NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_cita FOREIGN KEY (id_cita_fk) REFERENCES cita(id_cita)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_historial_usuario FOREIGN KEY (id_usuario_fk) REFERENCES usuario(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_historial_cita (id_cita_fk, creado_en)
);

CREATE TABLE IF NOT EXISTS notificacion (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_fk INT NOT NULL,
    id_cita_fk INT NULL,
    canal ENUM('EMAIL', 'SMS') NOT NULL DEFAULT 'EMAIL',
    tipo VARCHAR(40) NOT NULL,
    mensaje VARCHAR(500) NOT NULL,
    estado ENUM('SIN_PROVEEDOR', 'PENDIENTE', 'ENVIADA', 'ERROR')
        NOT NULL DEFAULT 'SIN_PROVEEDOR',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leido_en TIMESTAMP NULL,
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario_fk) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notificacion_cita FOREIGN KEY (id_cita_fk) REFERENCES cita(id_cita)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_notificacion_usuario (id_usuario_fk, creado_en)
);

CREATE TABLE IF NOT EXISTS configuracion_sistema (
    clave VARCHAR(80) PRIMARY KEY,
    valor VARCHAR(255) NOT NULL,
    actualizado_por_fk INT NULL,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_configuracion_usuario FOREIGN KEY (actualizado_por_fk) REFERENCES usuario(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS registro_auditoria (
    id_auditoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_fk INT NULL,
    accion VARCHAR(60) NOT NULL,
    entidad VARCHAR(60) NOT NULL,
    id_entidad VARCHAR(80) NULL,
    resultado SMALLINT NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (id_usuario_fk) REFERENCES usuario(id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_auditoria_fecha (creado_en),
    INDEX idx_auditoria_usuario (id_usuario_fk, creado_en)
);
