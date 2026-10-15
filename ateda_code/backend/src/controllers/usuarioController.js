const usuarioService = require('../services/usuarioService');


// Crear usuario
const crearUsuario = async (req, res) =>{
    try{
        const resultado = await usuarioService.crearUsuario(req.body);
        
        return res.status(resultado.estado).json(resultado);
    }catch(error){
        return manejarError(error, res);
    }
};

// Listar usuario
const listarUsuarios = async (req, res) =>{
    try{
        const resultado = await usuarioService.listarUsuarios();

        return res.status(resultado.estado).json(resultado);
    
    }catch(error){
        return manejarError(error, res);
    }
};

// Buscar usuario por ID
const buscarUsuarios = async (req, res) => {
    try{
        const resultado = await usuarioService.buscarUsuario(req.params.id);

        return res.status(resultado.estado).json(resultado);
    
    }catch(error){
        return manejarError(error, res);
    }
};

// Modificar usuario
const modificarUsuario = async (req, res) => {
    try{
        const resultado = await usuarioService.modificarUsuario(
            req.params.id,
            req.body
        );
        return res.status(resultado.estado).json(resultado);
    }catch(error){
        return manejarError(error, res);
    }
};

//Activar o desactivar usuario
const cambiarEstadoUsuario = async (req, res) => {
    try{
        const resultado = await usuarioService.cambiarEstadoUsuario(
            req.params.id,
            req.body.activo,
            req.session.usuario.id_usuario
        );

        return res.status(resultado.estado).json(resultado);

    }catch(error){
        return manejarError(error, res);
    }
};

//Listar roles disponibles
const listarRoles = async (req, res) => {
    try{
        const resultado = await usuarioService.listarRoles();

        return res.status(resultado.estado).json(resultado);
    }catch(error){
        return manejarError(error, res);
    }
};

// Manejar errores de base de datos y servidor
const manejarError = (error, res) => {
    console.error('Error en gestión de usuarios:', error);

    // PostgreSQL: valor duplicado
    if(error.code === '23505'){
        return res.status(409).json({
            mensaje: 'El correo ya se encuentra registrado'
        });
    }

    // PostgreSQL: dato con formato inválido
    if(error.code === '22P02'){
        return res.status(400).json({
            mensaje: 'Los datos ingresados no son válidos'
        });
    }

    return res.status(500).json({
        mensaje: 'Error interno del servidor'
    });
};

module.exports = {
    crearUsuario,
    listarUsuarios,
    buscarUsuarios,
    modificarUsuario,
    cambiarEstadoUsuario,
    listarRoles
};

