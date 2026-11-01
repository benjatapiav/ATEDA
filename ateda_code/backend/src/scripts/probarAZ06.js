
const alertaRepository = require('../repositories/alertaRepository');
const alertaService = require('../services/alertaService');

// ==================================================
// DATOS SIMULADOS PARA AZ-06
// ==================================================

const calificacionesSimuladas = [
    {
        estudiante_id: 'EST_PRUEBA',
        asignatura_id: 'ART_PRUEBA',
        asignatura: 'Artes Visuales',
        clasificacion: 'No troncal',
        evaluacion_id: 'EVA_PRUEBA_01',
        calificacion_id: 'CAL_PRUEBA_01',
        nota: 3.2,
        fecha: '2026-05-05'
    },
    {
        estudiante_id: 'EST_PRUEBA',
        asignatura_id: 'MUS_PRUEBA',
        asignatura: 'Música',
        clasificacion: 'No troncal',
        evaluacion_id: 'EVA_PRUEBA_02',
        calificacion_id: 'CAL_PRUEBA_02',
        nota: 3.1,
        fecha: '2026-05-10'
    },
    {
        estudiante_id: 'EST_PRUEBA',
        asignatura_id: 'ART_PRUEBA',
        asignatura: 'Artes Visuales',
        clasificacion: 'No troncal',
        evaluacion_id: 'EVA_PRUEBA_03',
        calificacion_id: 'CAL_PRUEBA_03',
        nota: 3.3,
        fecha: '2026-05-15'
    },
    {
        estudiante_id: 'EST_PRUEBA',
        asignatura_id: 'MUS_PRUEBA',
        asignatura: 'Música',
        clasificacion: 'No troncal',
        evaluacion_id: 'EVA_PRUEBA_04',
        calificacion_id: 'CAL_PRUEBA_04',
        nota: 3.0,
        fecha: '2026-05-20'
    }
];

// ==================================================
// EJECUTAR PRUEBA SIN MODIFICAR POSTGRESQL
// ==================================================

const ejecutarPrueba = async () => {

    const obtenerOriginal =
        alertaRepository.obtenerCalificacionesPorTipo;

    try {

        alertaRepository.obtenerCalificacionesPorTipo = async () => {
            return calificacionesSimuladas;
        };

        const resultados = await alertaService.evaluarAZ06();

        console.log('Resultados AZ-06:', resultados.length);
        console.log(resultados);

    } finally {

        alertaRepository.obtenerCalificacionesPorTipo =
            obtenerOriginal;
    }
};

ejecutarPrueba().catch(console.error);
