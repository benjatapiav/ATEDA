
const { validarCredenciales } = require('../services/authService');

// HU-001: Iniciar sesión
const login = async (req, res) => {
    try {
        const { correo, password } = req.body || {};

        const resultado = await validarCredenciales(correo, password);

        if (!resultado.valido) {
            return res.status(resultado.codigo).json({
                mensaje: resultado.mensaje
            });
        }

        // Regenerar la sesión al autenticarse
        req.session.regenerate((error) => {
            if (error) {
                console.error('Error al crear sesión:', error.message);
                return res.status(500).json({
                    mensaje: 'No fue posible iniciar sesión'
                });
            }

            // Guardar solo los datos necesarios
            req.session.usuario = {
                id_usuario: resultado.usuario.id_usuario,
                nombres: resultado.usuario.nombres,
                rol: resultado.usuario.rol
            };

            req.session.save((error) => {
                if (error) {
                    console.error('Error al guardar sesión:', error.message);
                    return res.status(500).json({
                        mensaje: 'No fue posible guardar la sesión'
                    });
                }

                return res.status(200).json({
                    mensaje: 'Sesión iniciada correctamente',
                    usuario: req.session.usuario
                });
            });
        });
    } catch (error) {
        console.error('Error en inicio de sesión:', error.message);

        return res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
};

// Consultar la sesión activa
const obtenerSesion = (req, res) => {
    return res.status(200).json({
        usuario: req.session.usuario
    });
};

// HU-003: Cerrar sesión
const cerrarSesion = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Error al cerrar sesión:', error.message);

            return res.status(500).json({
                mensaje: 'No fue posible cerrar la sesión'
            });
        }

        // Eliminar la cookie de sesión del navegador
        res.clearCookie('connect.sid', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/'
        });

        return res.status(200).json({
            mensaje: 'Sesión cerrada correctamente'
        });
    });
};

module.exports = {
    login,
    obtenerSesion,
    cerrarSesion
};
