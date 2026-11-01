
const alertaRepository = require('../repositories/alertaRepository');
const { analizarObservaciones } = require('./analisisObservacionesService');
const { validarAnalisisObservaciones } = require('./validacionObservacionesService');

// ==================================================
// AZ-01: CALIFICACIÓN INFERIOR A 3.0
// ==================================================

const evaluarAZ01 = async () => {

    const calificaciones = await alertaRepository.buscarCalificacionesCriticas();

    return calificaciones.map(calificacion => ({
        estudiante_id: calificacion.estudiante_id,
        regla: 'AZ-01',
        nivel: 'Azul',
        motivo: `Calificación ${calificacion.nota} en ${calificacion.asignatura}`,
        calificacion_id: calificacion.calificacion_id,
        evaluacion_id: calificacion.evaluacion_id,
        fecha: calificacion.fecha
    }));
};

// ==================================================
// IDENTIFICAR SEMESTRE ACADÉMICO
// ==================================================

const obtenerSemestre = (fecha) => {

    const fechaEvaluacion = new Date(fecha);
    const anio = fechaEvaluacion.getUTCFullYear();
    const mes = fechaEvaluacion.getUTCMonth() + 1;

    return {
        anio,
        semestre: mes <= 6 ? 1 : 2
    };
};

// ==================================================
// AZ-02: CAÍDA DESDE ALTO RENDIMIENTO
// ==================================================

const evaluarAZ02 = async () => {

    const historial = await alertaRepository.obtenerHistorialAcademico();
    const grupos = new Map();
    const resultados = [];

    // Agrupar por estudiante y asignatura.
    for (const registro of historial) {

        const clave = `${registro.estudiante_id}|${registro.asignatura_id}`;

        if (!grupos.has(clave)) {
            grupos.set(clave, []);
        }

        grupos.get(clave).push(registro);
    }

    // Evaluar el promedio del semestre anterior.
    for (const registros of grupos.values()) {

        const semestres = new Map();

        for (const registro of registros) {

            const periodo = obtenerSemestre(registro.fecha);
            const clave = `${periodo.anio}-${periodo.semestre}`;

            if (!semestres.has(clave)) {
                semestres.set(clave, []);
            }

            semestres.get(clave).push(registro);
        }

        for (const registro of registros) {

            if (Number(registro.nota) >= 3.5) {
                continue;
            }

            const periodo = obtenerSemestre(registro.fecha);

            const semestreAnterior = periodo.semestre === 1
                ? `${periodo.anio - 1}-2`
                : `${periodo.anio}-1`;

            const notasAnteriores = semestres.get(semestreAnterior) || [];

            if (notasAnteriores.length === 0) {
                continue;
            }

            const suma = notasAnteriores.reduce(
                (total, nota) => total + Number(nota.nota), 0
            );

            const promedioAnterior = suma / notasAnteriores.length;

            if (promedioAnterior > 6.0) {

                resultados.push({
                    estudiante_id: registro.estudiante_id,
                    regla: 'AZ-02',
                    nivel: 'Azul',
                    motivo: `Caída de rendimiento en ${registro.asignatura}: promedio anterior ${promedioAnterior.toFixed(2)}, nueva nota ${registro.nota}`,
                    calificacion_id: registro.calificacion_id,
                    evaluacion_id: registro.evaluacion_id,
                    fecha: registro.fecha
                });
            }
        }
    }

    return resultados;
};

// ==================================================
// AZ-03: DOS EVALUACIONES CON NOTAS INFERIORES A 3.5
// ==================================================

const evaluarAZ03 = async () => {

    const historial = await alertaRepository.obtenerHistorialAcademico();
    const grupos = new Map();
    const resultados = [];

    // Agrupar notas bajas por estudiante y asignatura.
    for (const registro of historial) {

        if (Number(registro.nota) >= 3.5) {
            continue;
        }

        const clave = `${registro.estudiante_id}|${registro.asignatura_id}`;

        if (!grupos.has(clave)) {
            grupos.set(clave, new Map());
        }

        grupos.get(clave).set(registro.evaluacion_id, registro);
    }

    // Comprobar dos evaluaciones diferentes.
    for (const evaluaciones of grupos.values()) {

        if (evaluaciones.size < 2) {
            continue;
        }

        const registros = Array.from(evaluaciones.values());

        resultados.push({
            estudiante_id: registros[0].estudiante_id,
            regla: 'AZ-03',
            nivel: 'Azul',
            motivo: `Dos o más evaluaciones con calificaciones inferiores a 3.5 en ${registros[0].asignatura}`,
            calificaciones_id: registros.map(registro => registro.calificacion_id),
            evaluaciones_id: registros.map(registro => registro.evaluacion_id),
            fecha: registros[registros.length - 1].fecha
        });
    }

    return resultados;
};

// ==================================================
// AZ-04: NOTAS BAJAS EN DOS TRONCALES EN 30 DÍAS
// ==================================================

const evaluarAZ04 = async () => {

    const historial = await alertaRepository.obtenerHistorialAcademico();
    const estudiantes = new Map();
    const resultados = [];

    // Reunir notas bajas por estudiante.
    for (const registro of historial) {

        if (Number(registro.nota) >= 3.5) {
            continue;
        }

        if (!estudiantes.has(registro.estudiante_id)) {
            estudiantes.set(registro.estudiante_id, []);
        }

        estudiantes.get(registro.estudiante_id).push(registro);
    }

    // Comparar asignaturas diferentes.
    for (const [estudianteId, registros] of estudiantes) {

        registros.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        for (let i = 0; i < registros.length; i++) {

            const primera = registros[i];

            for (let j = i + 1; j < registros.length; j++) {

                const segunda = registros[j];

                if (primera.asignatura_id === segunda.asignatura_id) {
                    continue;
                }

                // ==================================================
                // VALIDAR MISMO SEMESTRE ACADÉMICO
                // ==================================================

                const periodoPrimera = obtenerSemestre(primera.fecha);
                const periodoSegunda = obtenerSemestre(segunda.fecha);

                if (
                    periodoPrimera.anio !== periodoSegunda.anio ||
                    periodoPrimera.semestre !== periodoSegunda.semestre
                ) {
                    continue;
                }

                const diferenciaDias =
                    (new Date(segunda.fecha) - new Date(primera.fecha))
                    / (1000 * 60 * 60 * 24);

                if (diferenciaDias > 30) {
                    break;
                }

                resultados.push({
                    estudiante_id: estudianteId,
                    regla: 'AZ-04',
                    nivel: 'Azul',
                    motivo: `Calificaciones inferiores a 3.5 en ${primera.asignatura} y ${segunda.asignatura}, dentro de ${diferenciaDias} días`,
                    calificaciones_id: [
                        primera.calificacion_id,
                        segunda.calificacion_id
                    ],
                    evaluaciones_id: [
                        primera.evaluacion_id,
                        segunda.evaluacion_id
                    ],
                    fecha: segunda.fecha
                });
            }
        }
    }

    return resultados;
};

// ==================================================
// AZ-05: UNA TRONCAL Y DOS NO TRONCALES EN 30 DÍAS
// ==================================================

const evaluarAZ05 = async () => {

    const calificaciones = await alertaRepository.obtenerCalificacionesPorTipo();
    const estudiantes = new Map();
    const resultados = [];

    // Agrupar calificaciones bajas por estudiante.
    for (const registro of calificaciones) {

        if (!estudiantes.has(registro.estudiante_id)) {
            estudiantes.set(registro.estudiante_id, []);
        }

        estudiantes.get(registro.estudiante_id).push(registro);
    }

    // Buscar una troncal y dos no troncales.
    for (const [estudianteId, registros] of estudiantes) {

        registros.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        for (let i = 0; i < registros.length; i++) {

            const inicio = new Date(registros[i].fecha);


            // ==================================================
            // IDENTIFICAR SEMESTRE DE LA FECHA INICIAL
            // ==================================================

            const periodoInicio = obtenerSemestre(inicio);

            const ventana = registros.filter(registro => {

                const diferenciaDias =
                    (new Date(registro.fecha) - inicio)
                    / (1000 * 60 * 60 * 24);

                const periodoRegistro = obtenerSemestre(registro.fecha);

                return (
                    diferenciaDias >= 0 &&
                    diferenciaDias <= 30 &&
                    periodoRegistro.anio === periodoInicio.anio &&
                    periodoRegistro.semestre === periodoInicio.semestre
                );
            });

            const troncales = ventana.filter(
                registro => registro.clasificacion === 'Troncal'
            );

            const noTroncales = ventana.filter(
                registro => registro.clasificacion === 'No troncal'
            );

            if (troncales.length === 0 || noTroncales.length < 2) {
                continue;
            }

            const seleccion = [
                troncales[0],
                noTroncales[0],
                noTroncales[1]
            ];

            const identificador = seleccion
                .map(registro => registro.calificacion_id)
                .sort()
                .join('|');

            if (resultados.some(resultado => resultado.identificador === identificador)) {
                continue;
            }

            resultados.push({
                estudiante_id: estudianteId,
                regla: 'AZ-05',
                nivel: 'Azul',
                motivo: 'Una calificación inferior a 3.5 en una asignatura troncal y dos en asignaturas no troncales dentro de 30 días',
                calificaciones_id: seleccion.map(registro => registro.calificacion_id),
                evaluaciones_id: seleccion.map(registro => registro.evaluacion_id),
                fecha: seleccion.reduce(
                    (ultima, registro) =>
                        new Date(registro.fecha) > new Date(ultima)
                            ? registro.fecha
                            : ultima,
                    seleccion[0].fecha
                ),
                identificador
            });
        }
    }

    return resultados.map(({ identificador, ...resultado }) => resultado);
};

// ==================================================
// AZ-06: CUATRO NOTAS BAJAS EN DOS NO TRONCALES
// ==================================================

const evaluarAZ06 = async () => {

    const calificaciones = await alertaRepository.obtenerCalificacionesPorTipo();
    const estudiantes = new Map();
    const resultados = [];

    // Reunir solamente las calificaciones no troncales.
    for (const registro of calificaciones) {

        if (registro.clasificacion !== 'No troncal') {
            continue;
        }

        if (!estudiantes.has(registro.estudiante_id)) {
            estudiantes.set(registro.estudiante_id, []);
        }

        estudiantes.get(registro.estudiante_id).push(registro);
    }

    // Revisar ventanas de 30 días por estudiante.
    for (const [estudianteId, registros] of estudiantes) {

        registros.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        for (let i = 0; i < registros.length; i++) {

            const inicio = new Date(registros[i].fecha);

            // ==================================================
            // IDENTIFICAR SEMESTRE DE LA FECHA INICIAL
            // ==================================================

            const periodoInicio = obtenerSemestre(inicio);

            const ventana = registros.filter(registro => {

                const diferenciaDias =
                    (new Date(registro.fecha) - inicio)
                    / (1000 * 60 * 60 * 24);

                const periodoRegistro = obtenerSemestre(registro.fecha);

                return (
                    diferenciaDias >= 0 &&
                    diferenciaDias <= 30 &&
                    periodoRegistro.anio === periodoInicio.anio &&
                    periodoRegistro.semestre === periodoInicio.semestre
                );
            });

            // Contar evaluaciones diferentes.
            const evaluaciones = new Map();

            for (const registro of ventana) {
                if (!evaluaciones.has(registro.evaluacion_id)) {
                    evaluaciones.set(registro.evaluacion_id, registro);
                }
            }

            const registrosUnicos = Array.from(evaluaciones.values());

            if (registrosUnicos.length < 4) {
                continue;
            }

            const asignaturas = new Set(
                registrosUnicos.map(registro => registro.asignatura_id)
            );

            if (asignaturas.size < 2) {
                continue;
            }

            const seleccion = registrosUnicos.slice(0, 4);

            const asignaturasSeleccionadas = new Set(
                seleccion.map(registro => registro.asignatura_id)
            );

            if (asignaturasSeleccionadas.size < 2) {
                continue;
            }

            const identificador = seleccion
                .map(registro => registro.calificacion_id)
                .sort()
                .join('|');

            if (resultados.some(resultado => resultado.identificador === identificador)) {
                continue;
            }

            resultados.push({
                estudiante_id: estudianteId,
                regla: 'AZ-06',
                nivel: 'Azul',
                motivo: 'Cuatro calificaciones inferiores a 3.5 en al menos dos asignaturas no troncales dentro de 30 días',
                calificaciones_id: seleccion.map(registro => registro.calificacion_id),
                evaluaciones_id: seleccion.map(registro => registro.evaluacion_id),
                fecha: seleccion[seleccion.length - 1].fecha,
                identificador
            });
        }
    }

    return resultados.map(({ identificador, ...resultado }) => resultado);
};

// ==================================================
// AZ-07: ASISTENCIA MENSUAL INFERIOR AL 85 %
// ==================================================

const evaluarAZ07 = async () => {

    const asistencias = await alertaRepository.obtenerAsistenciasBajas();

    return asistencias.map(registro => ({
        estudiante_id: registro.estudiante_id,
        regla: 'AZ-07',
        nivel: 'Azul',
        motivo: `Asistencia de ${registro.porcentaje_asistencia}% en ${registro.mes}/${registro.anio}, inferior al 85%`,
        asistencia_id: registro.asistencia_id,
        anio: registro.anio,
        mes: registro.mes,
        porcentaje_asistencia: Number(registro.porcentaje_asistencia)
    }));
};



 // ==================================================
 // AZ-08: DIFICULTAD EDUCATIVA PERSISTENTE
 // EN OBSERVACIONES DOCENTES
 // ==================================================

 const evaluarAZ08 = async () => {

     const observaciones = await alertaRepository.obtenerObservacionesDocentes();
     const estudiantes = new Map();
     const resultados = [];

     // ==================================================
     // AGRUPAR OBSERVACIONES POR ESTUDIANTE
     // ==================================================

     for (const observacion of observaciones) {

         if (!estudiantes.has(observacion.estudiante_id)) {
             estudiantes.set(observacion.estudiante_id, []);
         }

         estudiantes.get(observacion.estudiante_id).push(observacion);
     }

     // ==================================================
     // ANALIZAR Y VALIDAR CADA ESTUDIANTE
     // ==================================================

     for (const [estudianteId, registros] of estudiantes) {

         const analisis = await analizarObservaciones(registros);

         if (!validarAnalisisObservaciones(analisis, registros)) {
             continue;
         }

         // Conservar solamente las observaciones citadas
         // como evidencia por el análisis.

         const evidencia = registros.filter(observacion =>
             analisis.observaciones_id.includes(observacion.observacion_id)
         );

         // ==================================================
         // IDENTIFICAR FECHA DE LA ÚLTIMA EVIDENCIA
         // ==================================================

         const ultimaFecha = evidencia.reduce((ultima, observacion) => {
             return new Date(observacion.fecha) > new Date(ultima)
                 ? observacion.fecha
                 : ultima;
         }, evidencia[0].fecha);

         // ==================================================
         // GENERAR RESULTADO DE AZ-08
         // ==================================================

         resultados.push({
             estudiante_id: estudianteId,
             regla: 'AZ-08',
             nivel: 'Azul',
             motivo: analisis.descripcion.trim(),
             observaciones_id: analisis.observaciones_id,
             fecha: ultimaFecha
         });
     }

     return resultados;
 };

 
 // ==================================================
 // AZ-09: DESCENSO CONSECUTIVO DE CALIFICACIONES
 // ==================================================


 // ==================================================
 // AZ-09: DESCENSO CONSECUTIVO DE CALIFICACIONES
 // DENTRO DE UN MISMO SEMESTRE ACADÉMICO
 // ==================================================

 const evaluarAZ09 = async () => {

     const historial = await alertaRepository.obtenerHistorialAcademico();
     const grupos = new Map();
     const resultados = [];

     // ==================================================
     // AGRUPAR POR ESTUDIANTE, ASIGNATURA Y SEMESTRE
     // ==================================================

     for (const registro of historial) {

         const periodo = obtenerSemestre(registro.fecha);

         const clave = [
             registro.estudiante_id,
             registro.asignatura_id,
             periodo.anio,
             periodo.semestre
         ].join('|');

         if (!grupos.has(clave)) {
             grupos.set(clave, []);
         }

         grupos.get(clave).push(registro);
     }

     // ==================================================
     // ANALIZAR CADA GRUPO SEMESTRAL
     // ==================================================

     for (const registros of grupos.values()) {

         registros.sort((a, b) => {

             const diferencia = new Date(a.fecha) - new Date(b.fecha);

             if (diferencia !== 0) {
                 return diferencia;
             }

             return String(a.evaluacion_id).localeCompare(
                 String(b.evaluacion_id)
             );
         });

         // ==================================================
         // AGRUPAR CALIFICACIONES POR EVALUACIÓN
         // ==================================================

         const evaluaciones = new Map();

         for (const registro of registros) {

             if (!evaluaciones.has(registro.evaluacion_id)) {

                 evaluaciones.set(registro.evaluacion_id, {
                     estudiante_id: registro.estudiante_id,
                     asignatura: registro.asignatura,
                     evaluacion_id: registro.evaluacion_id,
                     fecha: registro.fecha,
                     calificaciones: []
                 });
             }

             evaluaciones.get(registro.evaluacion_id).calificaciones.push({
                 calificacion_id: registro.calificacion_id,
                 nota: Number(registro.nota)
             });
         }

         // ==================================================
         // CALCULAR PROMEDIO POR EVALUACIÓN
         // ==================================================

         const registrosUnicos = [];

         for (const evaluacion of evaluaciones.values()) {

             const calificaciones = evaluacion.calificaciones;

             if (
                 calificaciones.length === 0 ||
                 calificaciones.some(
                     calificacion => !Number.isFinite(calificacion.nota)
                 )
             ) {
                 continue;
             }

             const suma = calificaciones.reduce(
                 (total, calificacion) => total + calificacion.nota,
                 0
             );

             registrosUnicos.push({
                 ...evaluacion,
                 nota: suma / calificaciones.length,
                 calificaciones_id: calificaciones.map(
                     calificacion => calificacion.calificacion_id
                 )
             });
         }

         if (registrosUnicos.length < 3) {
             continue;
         }

         // ==================================================
         // COMPARAR TRES EVALUACIONES CONSECUTIVAS
         // ==================================================

         for (let i = 0; i <= registrosUnicos.length - 3; i++) {

             const primera = registrosUnicos[i];
             const segunda = registrosUnicos[i + 1];
             const tercera = registrosUnicos[i + 2];

             if (
                 segunda.nota >= primera.nota ||
                 tercera.nota >= segunda.nota
             ) {
                 continue;
             }

             // ==================================================
             // VALIDAR CAÍDA ACUMULADA
             // ==================================================

             const caida = primera.nota - tercera.nota;

             if (caida < 1.5 - 0.000000001) {
                 continue;
             }

             const periodo = obtenerSemestre(primera.fecha);

             // ==================================================
             // GENERAR RESULTADO AZ-09
             // ==================================================

             resultados.push({
                 estudiante_id: primera.estudiante_id,
                 regla: 'AZ-09',
                 nivel: 'Azul',
                 motivo: `Descenso consecutivo en ${primera.asignatura}, semestre ${periodo.semestre} de ${periodo.anio}: ${primera.nota.toFixed(2)} → ${segunda.nota.toFixed(2)} → ${tercera.nota.toFixed(2)}. Caída acumulada de ${caida.toFixed(2)} puntos`,
                 calificaciones_id: [
                     ...primera.calificaciones_id,
                     ...segunda.calificaciones_id,
                     ...tercera.calificaciones_id
                 ],
                 evaluaciones_id: [
                     primera.evaluacion_id,
                     segunda.evaluacion_id,
                     tercera.evaluacion_id
                 ],
                 anio: periodo.anio,
                 semestre: periodo.semestre,
                 fecha: tercera.fecha
             });
         }
     }

     return resultados;
 };



 // ==================================================
 // MOTOR DE ALERTAS ATEDA
 // EJECUTAR TODAS LAS REGLAS AZ-01 A AZ-09
 // ==================================================

 const evaluarTodasLasAlertas = async () => {

     const reglas = [
         { codigo: 'AZ-01', ejecutar: evaluarAZ01 },
         { codigo: 'AZ-02', ejecutar: evaluarAZ02 },
         { codigo: 'AZ-03', ejecutar: evaluarAZ03 },
         { codigo: 'AZ-04', ejecutar: evaluarAZ04 },
         { codigo: 'AZ-05', ejecutar: evaluarAZ05 },
         { codigo: 'AZ-06', ejecutar: evaluarAZ06 },
         { codigo: 'AZ-07', ejecutar: evaluarAZ07 },
         { codigo: 'AZ-08', ejecutar: evaluarAZ08 },
         { codigo: 'AZ-09', ejecutar: evaluarAZ09 }
     ];

     const resultados = [];
     const resumen = {};

     for (const regla of reglas) {

         const alertas = await regla.ejecutar();

         if (!Array.isArray(alertas)) {
             throw new Error(
                 `La regla ${regla.codigo} no devolvió un arreglo`
             );
         }

         resumen[regla.codigo] = alertas.length;

         resultados.push(...alertas);
     }


    // ==================================================
    // AGRUPAR DETECCIONES POR ESTUDIANTE
    // ==================================================
    
    const estudiantes = {};
    
    for (const alerta of resultados) {
    
        const estudianteId = alerta.estudiante_id;
    
        if (!estudiantes[estudianteId]) {
            estudiantes[estudianteId] = {
                total: 0,
                reglas: {}
            };
        }
    
        estudiantes[estudianteId].total++;
    
        const codigoRegla = alerta.regla;
    
        estudiantes[estudianteId].reglas[codigoRegla] =
            (estudiantes[estudianteId].reglas[codigoRegla] || 0) + 1;
    }

    return {
        total: resultados.length,
        totalEstudiantes: Object.keys(estudiantes).length,
        resumen,
        estudiantes,
        alertas: resultados
    };

 };


// ==================================================
// REGISTRAR ALERTAS GENERALES EN POSTGRESQL
// ==================================================

const registrarAlertasGenerales = async () => {

    // Ejecutar las nueve reglas de detección.
    const analisis = await evaluarTodasLasAlertas();

    const estudiantes = new Map();

    // ==================================================
    // AGRUPAR DETECCIONES POR ESTUDIANTE
    // ==================================================

    for (const deteccion of analisis.alertas) {

        const estudianteId = deteccion.estudiante_id;

        if (!estudiantes.has(estudianteId)) {
            estudiantes.set(estudianteId, []);
        }

        estudiantes.get(estudianteId).push(deteccion);
    }

    const alertasCreadas = [];

    // ==================================================
    // REGISTRAR UNA ALERTA GENERAL POR ESTUDIANTE
    // ==================================================

    for (const [estudianteId, detecciones] of estudiantes) {

        const reglas = [
            ...new Set(
                detecciones.map(deteccion => deteccion.regla)
            )
        ];

        const motivo = `Detecciones identificadas: ${reglas.join(', ')}`;

        const alerta = await alertaRepository.registrarAlertaGeneral(
            estudianteId,
            motivo
        );

        if (alerta) {
            alertasCreadas.push(alerta);
        }
    }

    // ==================================================
    // DEVOLVER RESULTADOS
    // ==================================================

    return {
        totalDetecciones: analisis.total,
        totalEstudiantes: analisis.totalEstudiantes,
        alertasCreadas: alertasCreadas.length,
        alertas: alertasCreadas
    };
};

// ==================================================
// INICIAR SEGUIMIENTO DE UNA ALERTA
// ==================================================

const iniciarSeguimiento = async (alertaId, usuarioId) => {

    // ==================================================
    // VALIDAR IDENTIFICADORES
    // ==================================================

    if (
        !Number.isSafeInteger(Number(alertaId)) ||
        Number(alertaId) <= 0
    ) {
        throw new Error('El identificador de la alerta no es válido');
    }

    if (
        !Number.isSafeInteger(Number(usuarioId)) ||
        Number(usuarioId) <= 0
    ) {
        throw new Error('El identificador del usuario no es válido');
    }

    // ==================================================
    // ACTUALIZAR ESTADO DE LA ALERTA
    // ==================================================

    const alerta = await alertaRepository.iniciarSeguimiento(
        alertaId,
        usuarioId
    );

    if (!alerta) {
        return null;
    }

    return alerta;
};


// ==================================================
// REGISTRAR INTERVENCIÓN DE SEGUIMIENTO
// ==================================================

const registrarIntervencion = async (
    alertaId,
    usuarioId,
    accion,
    resultado = null
) => {

    // ==================================================
    // VALIDAR IDENTIFICADORES
    // ==================================================

    if (
        !Number.isSafeInteger(Number(alertaId)) ||
        Number(alertaId) <= 0
    ) {
        throw new Error('El identificador de la alerta no es válido');
    }

    if (
        !Number.isSafeInteger(Number(usuarioId)) ||
        Number(usuarioId) <= 0
    ) {
        throw new Error('El identificador del usuario no es válido');
    }

    // ==================================================
    // VALIDAR DESCRIPCIÓN DE LA INTERVENCIÓN
    // ==================================================

    if (
        typeof accion !== 'string' ||
        accion.trim().length === 0
    ) {
        throw new Error('Debe ingresar una descripción de la intervención');
    }

    // ==================================================
    // VALIDAR RESULTADO OPCIONAL
    // ==================================================

    if (
        resultado !== null &&
        typeof resultado !== 'string'
    ) {
        throw new Error('El resultado de la intervención no es válido');
    }

    // ==================================================
    // REGISTRAR INTERVENCIÓN
    // ==================================================

    const intervencion = await alertaRepository.registrarIntervencion(
        alertaId,
        usuarioId,
        accion.trim(),
        resultado === null ? null : resultado.trim()
    );

    return intervencion;
};

// ==================================================
// OBTENER HISTORIAL DE SEGUIMIENTO DE UN ESTUDIANTE
// ==================================================

const obtenerHistorialSeguimiento = async (estudianteId) => {

    // ==================================================
    // VALIDAR IDENTIFICADOR DEL ESTUDIANTE
    // ==================================================

    if (
        typeof estudianteId !== 'string' ||
        estudianteId.trim().length === 0
    ) {
        throw new Error('El identificador del estudiante no es válido');
    }

    // ==================================================
    // CONSULTAR HISTORIAL EN POSTGRESQL
    // ==================================================

    const historial = await alertaRepository.obtenerHistorialSeguimiento(
        estudianteId.trim()
    );

    return {
        estudiante_id: estudianteId.trim(),
        totalIntervenciones: historial.length,
        intervenciones: historial
    };
};

// ==================================================
// OBTENER RESUMEN DE ALERTAS ACTIVAS POR NIVEL
// ==================================================

const obtenerResumenAlertas = async () => {

    const alertas = await alertaRepository.obtenerResumenAlertas();

    const resumen = {
        AZUL: 0,
        AMARILLO: 0,
        NARANJA: 0,
        ROJO: 0
    };

    alertas.forEach((alerta) => {
        if (Object.hasOwn(resumen, alerta.nivel)) {
            resumen[alerta.nivel] = alerta.total;
        }
    });

    return resumen;
};

// ==================================================
// OBTENER ESTUDIANTES CON ALERTAS ACTIVAS
// ==================================================

const obtenerEstudiantesConAlertas = async () => {

    const estudiantes = await alertaRepository.obtenerEstudiantesConAlertas();

    return estudiantes;
};


 // ==================================================
 // OBTENER FICHA INDIVIDUAL DE UN ESTUDIANTE
 // ==================================================

 const obtenerFichaEstudiante = async (estudianteId) => {

     const estudiante = await alertaRepository.obtenerFichaEstudiante(estudianteId);

     return estudiante;
 };


// ==================================================
// EXPORTAR FUNCIONES
// ==================================================
module.exports = {
    evaluarAZ01,
    evaluarAZ02,
    evaluarAZ03,
    evaluarAZ04,
    evaluarAZ05,
    evaluarAZ06,
    evaluarAZ07,
    evaluarAZ08,
    evaluarAZ09,
    evaluarTodasLasAlertas,
    registrarAlertasGenerales,
    iniciarSeguimiento,
    registrarIntervencion,
    obtenerHistorialSeguimiento,
    obtenerResumenAlertas,
    obtenerEstudiantesConAlertas,
    obtenerFichaEstudiante
};
