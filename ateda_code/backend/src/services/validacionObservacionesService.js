
 // ==================================================
 // ATEDA: VALIDACIÓN DEL ANÁLISIS DE OBSERVACIONES
 // ==================================================

 const validarAnalisisObservaciones = (analisis, observaciones) => {

     // ==================================================
     // VALIDAR DATOS DE ENTRADA
     // ==================================================

     if (
         !analisis ||
         typeof analisis !== 'object' ||
         Array.isArray(analisis) ||
         !Array.isArray(observaciones) ||
         observaciones.length === 0
     ) {
         return false;
     }

     // ==================================================
     // VALIDAR CAMPOS BOOLEANOS
     // ==================================================

     if (
         typeof analisis.dificultad_educativa !== 'boolean' ||
         typeof analisis.persistente !== 'boolean' ||
         typeof analisis.evidencia_suficiente !== 'boolean'
     ) {
         return false;
     }

     // ==================================================
     // VALIDAR DESCRIPCIÓN
     // ==================================================

     if (
         typeof analisis.descripcion !== 'string' ||
         analisis.descripcion.trim().length === 0
     ) {
         return false;
     }

     // ==================================================
     // VALIDAR IDENTIFICADORES DE OBSERVACIONES
     // ==================================================

     if (
         !Array.isArray(analisis.observaciones_id) ||
         analisis.observaciones_id.length === 0
     ) {
         return false;
     }

     const identificadores = analisis.observaciones_id;

     // Evitar identificadores duplicados.
     if (new Set(identificadores).size !== identificadores.length) {
         return false;
     }

     // Todas las observaciones deben pertenecer
     // al mismo estudiante.
     const estudianteId = observaciones[0].estudiante_id;

     if (observaciones.some(
         observacion => observacion.estudiante_id !== estudianteId
     )) {
         return false;
     }

     const observacionesValidas = new Map(
         observaciones.map(observacion => [
             observacion.observacion_id,
             observacion
         ])
     );

     for (const identificador of identificadores) {

         if (
             typeof identificador !== 'string' ||
             !observacionesValidas.has(identificador)
         ) {
             return false;
         }
     }

     // ==================================================
     // VALIDAR CONDICIONES DE AZ-08
     // ==================================================

     if (
         analisis.dificultad_educativa !== true ||
         analisis.persistente !== true ||
         analisis.evidencia_suficiente !== true
     ) {
         return false;
     }

     // ==================================================
     // RESULTADO
     // ==================================================

     return true;
 };

 // ==================================================
 // EXPORTAR FUNCIONES
 // ==================================================

 module.exports = {
     validarAnalisisObservaciones
 };
