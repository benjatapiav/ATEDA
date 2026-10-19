
const { buscarPorId } = require('../repositories/usuarioRepository');

// Verificar que el usuario tenga una sesión activa
// y que su cuenta siga habilitada.
const requiereAutenticacion = async (req, res, next) => {
    try {
        if (!req.session || !req.session.usuario) {
            return res.status(401).json({
                mensaje: 'Debe iniciar sesión'
            });
        }

        const idUsuario = req.session.usuario.id_usuario;

        // Consultar el estado actual del usuario en PostgreSQL
        const usuario = await buscarPorId(idUsuario);

        if (!usuario || !usuario.activo) {
            return req.session.destroy((error) => {
                if (error) {
                    console.error(
                        'Error al destruir la sesión:',
                        error.message
                    );

                    return res.status(500).json({
                        mensaje: 'Error al finalizar la sesión'
                    });
                }

                res.clearCookie('connect.sid', {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    path: '/'
                });

                return res.status(401).json({
                    mensaje: 'La cuenta está desactivada o no existe'
                });
            });
        }

        // Actualizar el rol de la sesión si cambió en la BD
        req.session.usuario.rol = usuario.rol;

        next();

    } catch (error) {
        console.error(
            'Error al verificar la autenticación:',
            error.message
        );

        return res.status(500).json({
            mensaje: 'Error al verificar la sesión'
        });
    }
};


// Verificar que el usuario sea administrador
const requiereAdministrador = async (req, res, next) => {
    requiereAutenticacion(req, res, () => {
        if (req.session.usuario.rol !== 'Administrador') {
            return res.status(403).json({
                mensaje: 'No tiene permisos para realizar esta operación'
            });
        }

        next();
    });
};

module.exports = {
    requiereAutenticacion,
    requiereAdministrador
};
