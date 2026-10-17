const bcrypt = require('bcrypt');
const userRepository = require('./user.repository');

async function createUser(userData) {
    const { nombre, correo, contrasena, id_rol } = userData;
    // El correo debe ser único
    const existingUser = await userRepository.findByEmail(correo);
    if (existingUser) {
        const error = new Error('Email is already registered');
        error.status = 409;
        throw error;
    }
    // El rol debe existir
    const role = await userRepository.findRoleById(id_rol);
    if (!role) {
        const error = new Error('Role does not exist');
        error.status = 400;
        throw error;
    }
    // Proteger contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const newUser = {
        nombre,
        correo,
        contrasena: hashedPassword,
        id_rol
    };
    const userId = await userRepository.create(newUser);
    return {
        id_usuario: userId,
        nombre,
        correo,
        id_rol
    };
} //fin createUser

// Listar usuarios 
async function getUsers() {
    return await userRepository.findAll();
}

// Consultar usuario por ID 
async function getUserById(id) {
    const user = await userRepository.findById(id);

    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    return user;
}

// Actualizar usuario 
async function updateUser(id, userData) {
    const user = await userRepository.findById(id);

    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    const existingEmail =
        await userRepository.findByEmail(userData.correo);

    if (
        existingEmail &&
        existingEmail.id_usuario !== Number(id)
    ) {
        const error = new Error('Email is already registered');
        error.status = 409;
        throw error;
    }

    const role =
        await userRepository.findRoleById(userData.id_rol);

    if (!role) {
        const error = new Error('Role does not exist');
        error.status = 400;
        throw error;
    }

    await userRepository.update(id, userData);

    return await userRepository.findById(id);
}

// Cambiar estado 
async function changeUserStatus(id, estado) {
    const user = await userRepository.findById(id);
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
    await userRepository.updateStatus(id, estado);
    return await userRepository.findById(id);
}
// Eliminación lógica 
async function deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }
    await userRepository.softDelete(id);
}

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    changeUserStatus,
    deleteUser,
};