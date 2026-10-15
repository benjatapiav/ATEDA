
const bcrypt = require('bcrypt');
const { buscarPorCorreo } = require('../repositories/usuarioRepository');

const validarCredenciales = async (correo, password) => {

    if (!correo || !password) {
        return {
            valido: false,
            codigo: 400,
            mensaje: 'Debe ingresar correo y contraseña'
        };
    }

    const usuario = await buscarPorCorreo(correo);

    if (!usuario || !usuario.activo) {
        return {
            valido: false,
            codigo: 401,
            mensaje: 'Credenciales incorrectas'
        };
    }

    const passwordValida = await bcrypt.compare(
        password,
        usuario.password_hash
    );

    if (!passwordValida) {
        return {
            valido: false,
            codigo: 401,
            mensaje: 'Credenciales incorrectas'
        };
    }

    return {
        valido: true,
        codigo: 200,
        usuario: {
            id_usuario: usuario.id_usuario,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            correo: usuario.correo,
            rol: usuario.rol
        }
    };
};

module.exports = { validarCredenciales };
