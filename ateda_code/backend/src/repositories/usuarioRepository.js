const pool = require('../config/database');

const buscarPorCorreo = async (correo) => {
    const consulta = `
        SELECT
            u.id_usuario,
            u.nombres,
            u.apellidos,
            u.correo,
            u.password_hash,
            u.activo,
            r.nombre AS rol
        FROM usuario AS u 
        INNER JOIN rol AS r
            ON u.id_rol = r.id_rol
        WHERE u.correo = $1
    `;

    const resultado = await pool.query(consulta, [correo]);

    return resultado.rows[0] || null;
};


const listarUsuarios = async () =>{
    const consulta = `
        SELECT
            u.id_usuario,
            u.nombres,
            u.apellidos,
            u.correo,
            u.activo,
            u.fecha_creacion,
            r.nombre AS rol
        FROM usuario AS u
        INNER JOIN rol AS r
            ON u.id_rol = r.id_rol
        ORDER BY u.id_usuario ASC
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
}

const buscarPorId = async (id_usuario) => {
    const consulta = `
        SELECT
            u.id_usuario,
            u.nombres,
            u.apellidos,
            u.correo,
            u.id_rol,
            u.activo,
            r.nombre AS rol
        FROM usuario AS u
        INNER JOIN rol AS r
            ON u.id_rol = r.id_rol
        WHERE u.id_usuario = $1
    `;

    const resultado = await pool.query(consulta, [id_usuario]);

    return resultado.rows[0] || null;
};

const crearUsuario = async (datos) => {
    const consulta =`
        INSERT INTO usuario (
            id_rol, nombres, apellidos, correo, password_hash
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING id_usuario
    `;

    const valores = [
        datos.id_rol,
        datos.nombres,
        datos.apellidos,
        datos.correo,
        datos.password_hash
    ];
    const resultado = await pool.query(consulta, valores);

    return resultado.rows[0];
};

const modificarUsuario = async (id_usuario, datos) => {
    const consulta = `
        UPDATE usuario
        SET
            nombres = $1,
            apellidos = $2,
            correo = $3,
            id_rol = $4
        WHERE id_usuario = $5
        RETURNING id_usuario
    `;

    const valores = [
        datos.nombres,
        datos.apellidos,
        datos.correo,
        datos.id_rol,
        id_usuario
    ];

    const resultado = await pool.query(consulta, valores);

    return resultado.rows[0] || null;

};

const cambiarEstadoUsuario = async (id_usuario, activo) =>{
    const consulta =`
        UPDATE usuario
        SET activo = $1
        WHERE id_usuario = $2
        RETURNING id_usuario, activo
    `;

    const resultado = await pool.query(consulta, [activo, id_usuario]);

    return resultado.rows[0] || null;
};

const listarRoles = async ()=>{
    const consulta =`
        SELECT id_rol, nombre
        FROM rol
        ORDER BY id_rol ASC
    `;

    const resultado = await pool.query(consulta);

    return resultado.rows;
    
};

module.exports = {
    buscarPorCorreo,
    listarUsuarios,
    buscarPorId,
    crearUsuario,
    modificarUsuario,
    cambiarEstadoUsuario,
    listarRoles
};

