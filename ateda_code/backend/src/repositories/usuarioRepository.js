const pool = require('../config/database');

// ==================================================
// BUSCAR USUARIO POR CORREO
// ==================================================

const buscarPorCorreo = async (correo) => {

    const consulta = `
        SELECT
            u.usuario_id AS id_usuario,
            u.nombre AS nombres,
            u.correo,
            u.password_hash,
            u.activo,
            r.nombre AS rol
        FROM usuarios AS u
        INNER JOIN roles AS r
            ON u.rol_id = r.rol_id
        WHERE u.correo = $1
    `;

    const resultado = await pool.query(consulta, [correo]);

    return resultado.rows[0] || null;
};

// ==================================================
// LISTAR USUARIOS
// ==================================================

const listarUsuarios = async () => {

    const consulta = `
        SELECT
            u.usuario_id AS id_usuario,
            u.nombre AS nombres,
            '' AS apellidos,
            u.correo,
            u.activo,
            NULL AS fecha_creacion,
            r.nombre AS rol
        FROM usuarios AS u
        INNER JOIN roles AS r
            ON u.rol_id = r.rol_id
        ORDER BY u.usuario_id ASC
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
};

// ==================================================
// BUSCAR USUARIO POR IDENTIFICADOR
// ==================================================

const buscarPorId = async (id_usuario) => {

    const consulta = `
        SELECT
            u.usuario_id AS id_usuario,
            u.nombre AS nombres,
            u.correo,
            u.rol_id AS id_rol,
            u.activo,
            r.nombre AS rol
        FROM usuarios AS u
        INNER JOIN roles AS r
            ON u.rol_id = r.rol_id
        WHERE u.usuario_id = $1
    `;

    const resultado = await pool.query(consulta, [id_usuario]);

    return resultado.rows[0] || null;
};

// ==================================================
// CREAR USUARIO
// ==================================================

const crearUsuario = async (datos) => {

    const consulta = `
        INSERT INTO usuarios (
            rol_id,
            nombre,
            correo,
            password_hash
        )
        VALUES ($1, $2, $3, $4)
        RETURNING usuario_id AS id_usuario
    `;

    const valores = [
        datos.id_rol,
        `${datos.nombres} ${datos.apellidos}`.trim(),
        datos.correo,
        datos.password_hash
    ];

    const resultado = await pool.query(consulta, valores);

    return resultado.rows[0];
};

// ==================================================
// MODIFICAR USUARIO
// ==================================================

const modificarUsuario = async (id_usuario, datos) => {

    const consulta = `
        UPDATE usuarios
        SET
            nombre = $1,
            correo = $2,
            rol_id = $3
        WHERE usuario_id = $4
        RETURNING usuario_id AS id_usuario
    `;

    const valores = [
        `${datos.nombres} ${datos.apellidos}`.trim(),
        datos.correo,
        datos.id_rol,
        id_usuario
    ];

    const resultado = await pool.query(consulta, valores);

    return resultado.rows[0] || null;
};

// ==================================================
// CAMBIAR ESTADO DEL USUARIO
// ==================================================

const cambiarEstadoUsuario = async (id_usuario, activo) => {

    const consulta = `
        UPDATE usuarios
        SET activo = $1
        WHERE usuario_id = $2
        RETURNING
            usuario_id AS id_usuario,
            activo
    `;

    const resultado = await pool.query(
        consulta,
        [activo, id_usuario]
    );

    return resultado.rows[0] || null;
};

// ==================================================
// LISTAR ROLES DISPONIBLES
// ==================================================

const listarRoles = async () => {

    const consulta = `
        SELECT
            rol_id AS id_rol,
            nombre
        FROM roles
        ORDER BY rol_id ASC
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
};

// ==================================================
// EXPORTAR FUNCIONES
// ==================================================

module.exports = {
    buscarPorCorreo,
    listarUsuarios,
    buscarPorId,
    crearUsuario,
    modificarUsuario,
    cambiarEstadoUsuario,
    listarRoles
};