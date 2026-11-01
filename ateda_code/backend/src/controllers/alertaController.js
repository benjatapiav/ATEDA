const alertaService = require('../services/alertaService');

// ==================================================
// INICIAR SEGUIMIENTO DE UNA ALERTA
// ==================================================

const iniciarSeguimiento = async (req, res) => {

    try {

        // ==================================================
        // OBTENER IDENTIFICADORES
        // ==================================================

        const alertaId = req.params.alertaId;
        const usuarioId = req.session.usuario.id_usuario;

        // ==================================================
        // INICIAR SEGUIMIENTO
        // ==================================================

        const alerta = await alertaService.iniciarSeguimiento(
            alertaId,
            usuarioId
        );

        if (!alerta) {
            return res.status(404).json({
                mensaje: 'La alerta no existe o no está pendiente'
            });
        }

        // ==================================================
        // RESPUESTA
        // ==================================================

        return res.status(200).json({
            mensaje: 'Seguimiento iniciado correctamente',
            alerta
        });

    } catch (error) {

        console.error(
            'Error al iniciar seguimiento:',
            error.message
        );

        if (error.message.includes('no es válido')) {
            return res.status(400).json({
                mensaje: error.message
            });
        }

        return res.status(500).json({
            mensaje: 'Error al iniciar seguimiento'
        });
    }
};


// ==================================================
// REGISTRAR INTERVENCIÓN DE SEGUIMIENTO
// ==================================================

const registrarIntervencion = async (req, res) => {

    try {

        // ==================================================
        // OBTENER DATOS
        // ==================================================

        const alertaId = req.params.alertaId;
        const usuarioId = req.session.usuario.id_usuario;

        const { accion, resultado } = req.body || {};

        // ==================================================
        // REGISTRAR INTERVENCIÓN
        // ==================================================

        const intervencion = await alertaService.registrarIntervencion(
            alertaId,
            usuarioId,
            accion,
            resultado ?? null
        );

        if (!intervencion) {
            return res.status(409).json({
                mensaje: 'No fue posible registrar la intervención. Verifique que la alerta esté en seguimiento y que el usuario esté activo'
            });
        }

        // ==================================================
        // RESPUESTA
        // ==================================================

        return res.status(201).json({
            mensaje: 'Intervención registrada correctamente',
            intervencion
        });

    } catch (error) {

        console.error(
            'Error al registrar intervención:',
            error.message
        );

        if (
            error.message.includes('no es válido') ||
            error.message.includes('Debe ingresar')
        ) {
            return res.status(400).json({
                mensaje: error.message
            });
        }

        return res.status(500).json({
            mensaje: 'Error al registrar intervención'
        });
    }
};


// ==================================================
// OBTENER HISTORIAL DE SEGUIMIENTO DE UN ESTUDIANTE
// ==================================================

const obtenerHistorialSeguimiento = async (req, res) => {

    try {

        // ==================================================
        // OBTENER IDENTIFICADOR DEL ESTUDIANTE
        // ==================================================

        const estudianteId = req.params.estudianteId;

        // ==================================================
        // CONSULTAR HISTORIAL
        // ==================================================

        const historial = await alertaService.obtenerHistorialSeguimiento(
            estudianteId
        );

        // ==================================================
        // RESPUESTA
        // ==================================================

        return res.status(200).json({
            mensaje: 'Historial de seguimiento obtenido correctamente',
            ...historial
        });

    } catch (error) {

        console.error(
            'Error al obtener historial de seguimiento:',
            error.message
        );

        if (error.message.includes('no es válido')) {
            return res.status(400).json({
                mensaje: error.message
            });
        }

        return res.status(500).json({
            mensaje: 'Error al obtener historial de seguimiento'
        });
    }
};

// ==================================================
// OBTENER RESUMEN DE ALERTAS ACTIVAS POR NIVEL
// ==================================================

const obtenerResumenAlertas = async (req, res) => {

    try {

        const resumen = await alertaService.obtenerResumenAlertas();

        return res.status(200).json({
            mensaje: 'Resumen de alertas obtenido correctamente',
            resumen: resumen
        });

    } catch (error) {

        console.error(
            'Error al obtener resumen de alertas:',
            error.message
        );

        return res.status(500).json({
            mensaje: 'Error al obtener resumen de alertas'
        });
    }
};


// ==================================================
// OBTENER ESTUDIANTES CON ALERTAS ACTIVAS
// ==================================================

const obtenerEstudiantesConAlertas = async (req, res) => {

    try {

        const estudiantes = await alertaService.obtenerEstudiantesConAlertas();

        return res.status(200).json({
            mensaje: 'Estudiantes con alertas obtenidos correctamente',
            total: estudiantes.length,
            estudiantes: estudiantes
        });

    } catch (error) {

        console.error(
            'Error al obtener estudiantes con alertas:',
            error.message
        );

        return res.status(500).json({
            mensaje: 'Error al obtener estudiantes con alertas'
        });
    }
};


 // ==================================================
 // OBTENER FICHA INDIVIDUAL DE UN ESTUDIANTE
 // ==================================================

 const obtenerFichaEstudiante = async (req, res) => {

     try {

         const { estudianteId } = req.params;

         const estudiante = await alertaService.obtenerFichaEstudiante(estudianteId);

         if (!estudiante) {
             return res.status(404).json({
                 mensaje: 'Estudiante no encontrado'
             });
         }

         return res.status(200).json({
             mensaje: 'Ficha del estudiante obtenida correctamente',
             estudiante
         });

     } catch (error) {

         console.error('Error al obtener ficha del estudiante:', error);

         return res.status(500).json({
             mensaje: 'Error interno al obtener la ficha del estudiante'
         });
     }
 };


// ==================================================
// EXPORTAR FUNCIONES
// ==================================================

module.exports = {
    iniciarSeguimiento,
    registrarIntervencion,
    obtenerHistorialSeguimiento,
    obtenerResumenAlertas,
    obtenerEstudiantesConAlertas,
    obtenerFichaEstudiante
};