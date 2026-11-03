const express = require('express');

const {
    iniciarSeguimiento,
    cerrarCaso,
    registrarIntervencion,
    obtenerHistorialSeguimiento,
    obtenerResumenAlertas,
    obtenerEstudiantesConAlertas,
    obtenerTodosLosEstudiantes,
    obtenerFichaEstudiante
} = require('../controllers/alertaController');

const {
    requiereAutenticacion
} = require('../middlewares/authMiddleware');

const router = express.Router();

// ==================================================
// OBTENER LISTADO GENERAL DE ESTUDIANTES
// ==================================================

router.get('/estudiantes/todos', requiereAutenticacion, obtenerTodosLosEstudiantes);

// ==================================================
// OBTENER ESTUDIANTES CON ALERTAS ACTIVAS
// ==================================================

router.get(
    '/estudiantes',
    requiereAutenticacion,
    obtenerEstudiantesConAlertas
);

// ==================================================
// OBTENER FICHA INDIVIDUAL DE UN ESTUDIANTE
// ==================================================

router.get(
    '/estudiantes/:estudianteId',
    requiereAutenticacion,
    obtenerFichaEstudiante
);

// ==================================================
// OBTENER RESUMEN DE ALERTAS ACTIVAS POR NIVEL
// ==================================================

router.get(
    '/resumen',
    requiereAutenticacion,
    obtenerResumenAlertas
);

// ==================================================
// INICIAR SEGUIMIENTO
// ==================================================

router.patch(
    '/:alertaId/iniciar-seguimiento',
    requiereAutenticacion,
    iniciarSeguimiento
);

// ==================================================
// CERRAR CASO DE UNA ALERTA
// ==================================================

router.patch(
    '/:alertaId/cerrar-caso',
    requiereAutenticacion,
    cerrarCaso
);

// ==================================================
// REGISTRAR INTERVENCIÓN
// ==================================================

router.post(
    '/:alertaId/intervenciones',
    requiereAutenticacion,
    registrarIntervencion
);

// ==================================================
// OBTENER HISTORIAL DE SEGUIMIENTO DE UN ESTUDIANTE
// ==================================================

router.get(
    '/estudiantes/:estudianteId/seguimientos',
    requiereAutenticacion,
    obtenerHistorialSeguimiento
);

// ==================================================
// EXPORTAR RUTAS
// ==================================================

module.exports = router;