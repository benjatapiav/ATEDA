// Verificar que el usuario tenga una sesión activa
const requiereAutenticacion = (req, res, next) => {
    if(!req.session || !req.session.usuario){
        return res.status(401).json({
            mensaje: 'Debe iniciar sesión'
        });
    }
    next();
};

const requiereAdministrador = (req, res, next) => {

    if (!req.session || !req.session.usuario) {
        return res.status(401).json({
            mensaje: 'Debe iniciar sesión'
        });
    }

    if (req.session.usuario.rol !== 'Administrador') {
        return res.status(403).json({
            mensaje: 'No tiene permisos para realizar esta operación'
        });
    }

    next();
};

module.exports = {
    requiereAdministrador,
    requiereAutenticacion
};