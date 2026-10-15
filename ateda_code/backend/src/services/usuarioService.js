const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarioRepository');

const crearUsuario = async (datos) => {
    const { nombres, apellidos, correo, password, id_rol } = datos;

    if(!nombres || !apellidos || !correo || !password || !id_rol){
        return{
            estado:400,
            mensaje: 'Todos los campos son obligatorios'
        };
    }

    if(typeof password !== 'string' || password.length < 8){
        return{
            estado: 400,
            mensaje: 'La contraseña debe tener al menos 8 caracteres'
        };
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const usuarioExistente = await usuarioRepository.buscarPorCorreo(correoNormalizado);

    if(usuarioExistente){
        return{
            estado:409,
            mensaje:'El correo ya se encuentra registrado'
        };
    }

    const roles = await usuarioRepository.listarRoles();

    const rolValido = roles.some(
        rol => rol.id_rol === Number(id_rol)
    );

    if(!rolValido){
        return {
            estado: 400,
            mensaje: 'El rol seleccionado no existe'
        };
    }

    const password_hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await usuarioRepository.crearUsuario({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        correo: correoNormalizado,
        password_hash,
        id_rol: Number(id_rol)
    });

    return{
        estado: 201,
        mensaje: 'Usuario creado correctamente',
        usuario: nuevoUsuario
    };
};

const listarUsuarios = async () => {
    const usuarios = await usuarioRepository.listarUsuarios();

    return{
        estado: 200,
        usuarios
    };
};

const buscarUsuario = async (id_usuario) => {
    const usuario = await usuarioRepository.buscarPorId(id_usuario);

    if(!usuario){
        return {
            estado: 404,
            mensaje: 'Usuario no encontrado'
        };
    }
    return { 
        estado: 200,
        usuario
    };
};


const modificarUsuario = async (id_usuario, datos) => {
    const { nombres, apellidos, correo, id_rol } = datos;

    const usuarioActual = await usuarioRepository.buscarPorId(id_usuario);

    if(!usuarioActual) {
        return {
            estado:404,
            mensaje: 'Usuario no encontrado'
        };
    }

    if(!nombres || !apellidos || !correo || !id_rol) {
        return {
            estado: 400,
            mensaje: 'Todos los campos son obligatorios'
        };
    }

    if (
        typeof nombres !== 'string' ||
        typeof apellidos !== 'string' ||
        typeof correo !== 'string' 
    ){
        return {
            estado:400,
            mensaje: 'los datos ingresados no son válidos'
        };
    }

    const correoNormalizado = correo.trim().toLocaleLowerCase();

    if(!nombres.trim() || !apellidos.trim() || !correoNormalizado) {
        return {
            estado:400,
            mensaje: 'Los campos no pueden estar vacíos'
        };
    }
    const roles = await usuarioRepository.listarRoles();

    const rolValido = roles.some(
        rol => rol.id_rol === Number(id_rol)
    );

    if(!rolValido) {
        return{
            estado:400,
            mensaje: 'El rol seleccionado no existe'
        };
    }

    const usuarioConCorreo = await usuarioRepository.buscarPorCorreo(correoNormalizado);

    if(
        usuarioConCorreo &&
        usuarioConCorreo.id_usuario !== usuarioActual.id_usuario
    ){
        return {
            estado: 409,
            mensaje: 'El correo ya pertenece a otro usuario'
        };
    }

    const usuarioModificado = await usuarioRepository.modificarUsuario(
        id_usuario,
        {
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            correo: correoNormalizado,
            id_rol:Number(id_rol)
        }
    );
    return {
        estado:200,
        mensaje: 'Usuario modificado correctamente',
        usuario: usuarioModificado
    };
};


const cambiarEstadoUsuario = async (id_usuario, activo, idAdministrador) => {
    if(typeof activo !== 'boolean'){
        return{
            estado:400,
            mensaje: 'El estado debe ser verdadero o falso'
        };
    }

    if(!activo && Number(id_usuario) === Number(idAdministrador)){
        return{
            estado:403,
            mensaje: 'No puedes desactivar tu propia cuenta'
        };
    }

    const usuario = await usuarioRepository.cambiarEstadoUsuario(
        id_usuario,
        activo
    );

    if(!usuario){
        return{
            estado:404,
            mensaje: 'Usuario no encontrado'
        };
    }
    return{
        estado:200,
        mensaje: activo
            ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente', usuario
    };
};


const listarRoles = async () => {
    const roles = await usuarioRepository.listarRoles();

    return {
        estado:200,
        roles
    };
};

module.exports = {
    crearUsuario,
    listarUsuarios,
    buscarUsuario,
    modificarUsuario,
    cambiarEstadoUsuario,
    listarRoles
};