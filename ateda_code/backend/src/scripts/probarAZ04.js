
 // ==================================================
 // ATEDA: PRUEBA CONTROLADA DE AZ-04
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
         nota: 3.2,
         fecha: '2026-06-25'
     },
     {
         estudiante_id: 'EST_PRUEBA',
         asignatura_id: 'LEN_PRUEBA',
         asignatura: 'Lenguaje',
         evaluacion_id: 'EVA_PRUEBA_02',
         calificacion_id: 'CAL_PRUEBA_02',
         nota: 3.1,
         fecha: '2026-07-05'
     }
 ];

 // ==================================================
 // EJECUTAR PRUEBA
 // ==================================================

 const ejecutarPrueba = async () => {

     const obtenerHistorialOriginal =
         alertaRepository.obtenerHistorialAcademico;

     try {

         // Sustituir temporalmente la consulta del repositorio.

         alertaRepository.obtenerHistorialAcademico = async () => {
             return calificacionesSimuladas;
         };

         const resultados = await alertaService.evaluarAZ04();

         console.log('Resultados AZ-04:', resultados.length);
         console.log(resultados);

     } finally {

         // Restaurar la función original.

         alertaRepository.obtenerHistorialAcademico =
             obtenerHistorialOriginal;
     }
 };

 ejecutarPrueba().catch(console.error);
