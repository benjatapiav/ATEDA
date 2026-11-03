
const pool = require('../config/database');

// ==================================================
// AZ-01: CONSULTAR CALIFICACIONES INFERIORES A 3.0
// ==================================================

const buscarCalificacionesCriticas = async () => {

    const consulta = `
        SELECT
            c.calificacion_id,
            c.estudiante_id,
            c.nota,
            e.evaluacion_id,
            e.fecha,
            a.nombre AS asignatura
        FROM calificaciones AS c
        INNER JOIN evaluaciones AS e
            ON c.evaluacion_id = e.evaluacion_id
        INNER JOIN asignaturas AS a
            ON e.asignatura_id = a.asignatura_id
        WHERE c.nota < 3.0
            AND (
                a.nombre ILIKE 'Matemática%'
                OR a.nombre ILIKE 'Lenguaje%'
                OR a.nombre ILIKE 'Historia%'
                OR a.nombre ILIKE 'Ciencias Naturales%'
            )
        ORDER BY e.fecha ASC, c.estudiante_id ASC
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
};

// ==================================================
// AZ-02, AZ-03 Y AZ-04: HISTORIAL DE TRONCALES
// ==================================================

const obtenerHistorialAcademico = async () => {

    const consulta = `
        SELECT
            c.calificacion_id,
            c.estudiante_id,
            c.nota,
            e.evaluacion_id,
            e.fecha,
            e.asignatura_id,
            a.nombre AS asignatura
        FROM calificaciones AS c
        INNER JOIN evaluaciones AS e
            ON c.evaluacion_id = e.evaluacion_id
        INNER JOIN asignaturas AS a
            ON e.asignatura_id = a.asignatura_id
        WHERE
            a.nombre ILIKE 'Matemática%'
            OR a.nombre ILIKE 'Lenguaje%'
            OR a.nombre ILIKE 'Historia%'
            OR a.nombre ILIKE 'Ciencias Naturales%'
        ORDER BY
            c.estudiante_id,
            e.asignatura_id,
            e.fecha,
            e.evaluacion_id
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
};

// ==================================================
// AZ-05 Y AZ-06: CONSULTAR NOTAS POR TIPO DE ASIGNATURA
// ==================================================

const obtenerCalificacionesPorTipo = async () => {

    const consulta = `
        SELECT
            c.calificacion_id,
            c.estudiante_id,
            c.nota,
            e.evaluacion_id,
            e.fecha,
            e.asignatura_id,
            a.nombre AS asignatura,
            CASE
                WHEN a.nombre ILIKE 'Matemática%'
                  OR a.nombre ILIKE 'Lenguaje%'
                  OR a.nombre ILIKE 'Historia%'
                  OR a.nombre ILIKE 'Ciencias Naturales%'
                THEN 'Troncal'
                ELSE 'No troncal'
            END AS clasificacion
        FROM calificaciones AS c
        INNER JOIN evaluaciones AS e
            ON c.evaluacion_id = e.evaluacion_id
        INNER JOIN asignaturas AS a
            ON e.asignatura_id = a.asignatura_id
        WHERE c.nota < 3.5
        ORDER BY
            c.estudiante_id,
            e.fecha,
            e.evaluacion_id
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
};

// ==================================================
// AZ-07: CONSULTAR ASISTENCIA DE MESES FINALIZADOS
// ==================================================

const obtenerAsistenciasBajas = async () => {

    const consulta = `
        SELECT
            asistencia_id,
            estudiante_id,
            anio,
            mes,
            dias_clase,
            dias_presentes,
            ROUND(
                dias_presentes * 100.0 / NULLIF(dias_clase, 0),
                2
            ) AS porcentaje_asistencia
        FROM asistencia_mensual
        WHERE dias_clase > 0
            AND dias_presentes * 100.0 / dias_clase < 85
            AND MAKE_DATE(anio::integer, mes::integer, 1)
                < DATE_TRUNC('month', CURRENT_DATE)::date
        ORDER BY
            anio,
            mes,
            estudiante_id
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
};

// ==================================================
// AZ-08: CONSULTAR OBSERVACIONES DOCENTES
// ==================================================

const obtenerObservacionesDocentes = async () => {

    const consulta = `
        SELECT
            observacion_id,
            estudiante_id,
            fecha,
            dimension,
            caracter,
            texto
        FROM observaciones
        ORDER BY
            estudiante_id,
            fecha,
            observacion_id
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
};

// ==================================================
// REGISTRAR ALERTA GENERAL DE UN ESTUDIANTE
// ==================================================

const registrarAlertaGeneral = async (estudianteId, motivo) => {

    const consulta = `
        INSERT INTO alertas (
            estudiante_id,
            nivel,
            estado,
            motivo
        )
        VALUES ($1, 'AZUL', 'PENDIENTE', $2)

        ON CONFLICT (estudiante_id)
        WHERE estado <> 'CERRADO'
        DO NOTHING

        RETURNING alerta_id, estudiante_id, nivel, estado
    `;

    const resultado = await pool.query(consulta, [
        estudianteId,
        motivo
    ]);

    return resultado.rows[0] || null;
};


// ==================================================
// INICIAR SEGUIMIENTO DE UNA ALERTA
// ==================================================

const iniciarSeguimiento = async (alertaId, usuarioId) => {

    const consulta = `
        UPDATE alertas
        SET
            estado = 'EN SEGUIMIENTO',
            usuario_responsable_id = $2,
            fecha_inicio_seguimiento = CURRENT_TIMESTAMP
        WHERE alerta_id = $1
          AND estado = 'PENDIENTE'
        RETURNING
            alerta_id,
            estudiante_id,
            nivel,
            estado,
            usuario_responsable_id,
            fecha_inicio_seguimiento
    `;

    const resultado = await pool.query(consulta, [
        alertaId,
        usuarioId
    ]);

    return resultado.rows[0] || null;
};


// ==================================================
// CERRAR CASO DE UNA ALERTA
// ==================================================

const cerrarCaso = async (alertaId, usuarioId, motivoCierre, observacionCierre) => {

    const consulta = `
        UPDATE alertas
        SET
            estado = 'CERRADO',
            motivo_cierre = $3,
            observacion_cierre = $4,
            fecha_cierre = CURRENT_TIMESTAMP,
            usuario_responsable_id = $2
        WHERE alerta_id = $1
          AND estado = 'EN SEGUIMIENTO'
        RETURNING
            alerta_id,
            estudiante_id,
            nivel,
            estado,
            motivo_cierre,
            observacion_cierre,
            fecha_cierre,
            usuario_responsable_id
    `;

    const resultado = await pool.query(consulta, [
        alertaId,
        usuarioId,
        motivoCierre,
        observacionCierre
    ]);

    return resultado.rows[0] || null;
};


// ==================================================
// REGISTRAR INTERVENCIÓN DE SEGUIMIENTO
// ==================================================

const registrarIntervencion = async (alertaId, usuarioId, accion, resultado) => {

    const consulta = `
        INSERT INTO seguimientos (
            seguimiento_id,
            estudiante_id,
            fecha,
            responsable_rol,
            accion,
            resultado,
            estado_caso,
            usuario_id,
            alerta_id
        )
        SELECT
            'SEG2026' || LPAD(
                nextval('seguimientos_id_seq')::TEXT,
                3,
                '0'
            ),
            a.estudiante_id,
            CURRENT_DATE,
            r.nombre,
            $3,
            $4,
            a.estado,
            u.usuario_id,
            a.alerta_id
        FROM alertas AS a
        INNER JOIN usuarios AS u
            ON u.usuario_id = $2
        INNER JOIN roles AS r
            ON r.rol_id = u.rol_id
        WHERE a.alerta_id = $1
          AND a.estado = 'EN SEGUIMIENTO'
          AND u.activo = TRUE
        RETURNING
            seguimiento_id,
            estudiante_id,
            fecha,
            responsable_rol,
            accion,
            resultado,
            estado_caso,
            usuario_id,
            alerta_id
    `;

    const resultadoConsulta = await pool.query(consulta, [
        alertaId,
        usuarioId,
        accion,
        resultado
    ]);

    return resultadoConsulta.rows[0] || null;
};


// ==================================================
// OBTENER HISTORIAL DE SEGUIMIENTO DE UN ESTUDIANTE
// ==================================================

const obtenerHistorialSeguimiento = async (estudianteId) => {

    const consulta = `
        SELECT
            s.seguimiento_id,
            s.estudiante_id,
            s.fecha,
            s.responsable_rol,
            s.accion,
            s.resultado,
            s.estado_caso,
            s.usuario_id,
            u.nombre AS profesional,
            s.alerta_id
        FROM seguimientos AS s
        LEFT JOIN usuarios AS u
            ON u.usuario_id = s.usuario_id
        WHERE s.estudiante_id = $1
        ORDER BY
            s.fecha DESC,
            s.seguimiento_id DESC
    `;

    const resultado = await pool.query(consulta, [estudianteId]);

    return resultado.rows;
};


// ==================================================
// OBTENER RESUMEN DE ALERTAS ACTIVAS POR NIVEL
// ==================================================

const obtenerResumenAlertas = async () => {

    const consulta = `
        SELECT
            nivel,
            COUNT(*)::INTEGER AS total
        FROM alertas
        WHERE estado <> 'CERRADO'
        GROUP BY nivel
        ORDER BY
            CASE nivel
                WHEN 'AZUL' THEN 1
                WHEN 'AMARILLO' THEN 2
                WHEN 'NARANJA' THEN 3
                WHEN 'ROJO' THEN 4
            END
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
};



// ==================================================
// OBTENER ESTUDIANTES CON ALERTAS ACTIVAS
// ==================================================

const obtenerEstudiantesConAlertas = async () => {

    const consulta = `
        SELECT
            a.alerta_id,
            e.estudiante_id,
            e.nombres,
            e.apellido_paterno,
            e.apellido_materno,
            m.curso,
            m.seccion,
            m.anio,
            a.nivel,
            a.estado,
            a.motivo

        FROM alertas AS a

        INNER JOIN estudiantes AS e
            ON a.estudiante_id = e.estudiante_id

        LEFT JOIN LATERAL (
            SELECT
                curso,
                seccion,
                anio
            FROM matriculas
            WHERE estudiante_id = e.estudiante_id
            ORDER BY anio DESC, matricula_id DESC
            LIMIT 1
        ) AS m ON TRUE

        WHERE a.estado <> 'CERRADO'

        ORDER BY
            CASE a.nivel
                WHEN 'ROJO' THEN 1
                WHEN 'NARANJA' THEN 2
                WHEN 'AMARILLO' THEN 3
                WHEN 'AZUL' THEN 4
            END,
            e.apellido_paterno,
            e.nombres
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
};


 // ==================================================
 // OBTENER TODOS LOS ESTUDIANTES
 // ==================================================

const obtenerTodosLosEstudiantes = async () => {

    const consulta = `
        SELECT
            e.estudiante_id,
            e.nombres,
            e.apellido_paterno,
            e.apellido_materno,
            m.curso,
            m.seccion,
            m.anio,
            a.alerta_id,
            a.nivel,
            a.estado,
            a.motivo

        FROM estudiantes AS e

        LEFT JOIN LATERAL (
            SELECT
                curso,
                seccion,
                anio
            FROM matriculas
            WHERE estudiante_id = e.estudiante_id
            ORDER BY anio DESC, matricula_id DESC
            LIMIT 1
        ) AS m ON TRUE

        LEFT JOIN alertas AS a
            ON a.estudiante_id = e.estudiante_id
            AND a.estado <> 'CERRADO'

        ORDER BY
            CASE a.nivel
                WHEN 'ROJO' THEN 1
                WHEN 'NARANJA' THEN 2
                WHEN 'AMARILLO' THEN 3
                WHEN 'AZUL' THEN 4
                ELSE 5
            END,
            e.apellido_paterno,
            e.apellido_materno,
            e.nombres
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
};


// ==================================================
// OBTENER FICHA DE UN ESTUDIANTE
// ==================================================

const obtenerFichaEstudiante = async (estudianteId) => {

    const consulta = `
        SELECT
            e.estudiante_id,
            e.nombres,
            e.apellido_paterno,
            e.apellido_materno,
            e.fecha_nacimiento,
            m.curso,
            m.seccion,
            m.anio,
            a.alerta_id,
            a.nivel,
            a.estado,
            a.motivo

        FROM estudiantes AS e

        LEFT JOIN LATERAL (
            SELECT
                curso,
                seccion,
                anio
            FROM matriculas
            WHERE estudiante_id = e.estudiante_id
            ORDER BY anio DESC, matricula_id DESC
            LIMIT 1
        ) AS m ON TRUE

        LEFT JOIN alertas AS a
            ON a.estudiante_id = e.estudiante_id
            AND a.estado <> 'CERRADO'

        WHERE e.estudiante_id = $1
    `;

    const resultado = await pool.query(consulta, [estudianteId]);

    return resultado.rows[0] || null;
};


// ==================================================
// EXPORTAR FUNCIONES
// ==================================================
module.exports = {
    buscarCalificacionesCriticas,
    obtenerHistorialAcademico,
    obtenerCalificacionesPorTipo,
    obtenerAsistenciasBajas,
    obtenerObservacionesDocentes,
    registrarAlertaGeneral,
    iniciarSeguimiento,
    cerrarCaso,
    registrarIntervencion,
    obtenerHistorialSeguimiento,
    obtenerResumenAlertas,
    obtenerEstudiantesConAlertas,
    obtenerTodosLosEstudiantes,
    obtenerFichaEstudiante
};
