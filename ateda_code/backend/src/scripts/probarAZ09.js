
 // ==================================================
 // ATEDA: PRUEBA CONTROLADA DE AZ-09
 // ==================================================

 const alertaRepository = require('../repositories/alertaRepository');
 const alertaService = require('../services/alertaService');

 // ==================================================
 // DATOS SIMULADOS
 // ==================================================

 const calificacionesSimuladas = [
     {
         estudiante_id: 'EST_PRUEBA',
         asignatura_id: 'MAT_PRUEBA',
         asignatura: 'Matemática',
         evaluacion_id: 'EVA_PRUEBA_01',
         calificacion_id: 'CAL_PRUEBA_01',
         nota: 6.0,
         fecha: '2026-04-10'
     },
     {
         estudiante_id: 'EST_PRUEBA',
         asignatura_id: 'MAT_PRUEBA',
         asignatura: 'Matemática',
         evaluacion_id: 'EVA_PRUEBA_01',
         calificacion_id: 'CAL_PRUEBA_02',
         nota: 6.4,
         fecha: '2026-04-10'
     },
     {
         estudiante_id: 'EST_PRUEBA',
         asignatura_id: 'MAT_PRUEBA',
         asignatura: 'Matemática',
         evaluacion_id: 'EVA_PRUEBA_02',
         calificacion_id: 'CAL_PRUEBA_03',
         nota: 5.4,
         fecha: '2026-05-10'
     },
     {
         estudiante_id: 'EST_PRUEBA',
         asignatura_id: 'MAT_PRUEBA',
         asignatura: 'Matemática',
         evaluacion_id: 'EVA_PRUEBA_03',
         calificacion_id: 'CAL_PRUEBA_04',
         nota: 4.3,
         fecha: '2026-07-10'
     },
     {
         estudiante_id: 'EST_PRUEBA',
         asignatura_id: 'MAT_PRUEBA',
         asignatura: 'Matemática',
         evaluacion_id: 'EVA_PRUEBA_03',
         calificacion_id: 'CAL_PRUEBA_05',
         nota: 4.7,
         fecha: '2026-07-10'
     }
 ];

 // ==================================================
 // EJECUTAR PRUEBA
 // ==================================================

 const ejecutarPrueba = async () => {

     // Guardar temporalmente la función original.
     const obtenerHistorialOriginal =
         alertaRepository.obtenerHistorialAcademico;

     try {

         // Sustituir únicamente la respuesta del repositorio
         // durante esta ejecución de prueba.
         alertaRepository.obtenerHistorialAcademico = async () => {
             return calificacionesSimuladas;
         };

         const resultados = await alertaService.evaluarAZ09();

         console.log('Resultados AZ-09:', resultados.length);
         console.log(resultados);

     } finally {

         // Restaurar la función original.
         alertaRepository.obtenerHistorialAcademico =
             obtenerHistorialOriginal;
     }
 };

 ejecutarPrueba().catch(console.error);
