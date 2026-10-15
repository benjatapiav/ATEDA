
const bcrypt = require('bcrypt');
const pool = require('../config/database');

const crearAdministrador = async () =>{

    try{
        const nombres = 'Administrador';
        const apellidos = 'ATEDA';

        const correo = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        //comprobar si existen las credenciales
        if(!correo||!password){
            throw new Error('Faltan ADMIN_EMAIL o ADMIN_PASSWORD en .env');

        }

        // buscar el rol administrador
        const resultadoRol = await pool.query(
            'SELECT id_rol FROM rol WHERE nombre = $1',
            ['Administrador']
        );

        if (resultadoRol.rows.length === 0){
            throw new Error('No existe el rol Administrador');
        }
        
        const idRol = resultadoRol.rows[0].id_rol;

        // Comprobar si el usuario ya existe
        const resultadoUsuario = await pool.query(
            'SELECT id_usuario FROM usuario WHERE correo = $1',
            [correo]
        );

        if (resultadoUsuario.rows.length > 0){
            console.log('El administrador ya existe');
            return;
        }

        // Generar el hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 12);

        // Insertar el administrador en PostgreSQL
        await pool.query(
            `INSERT INTO usuario
                (id_rol, nombres, apellidos, correo, password_hash)
            VALUES($1, $2, $3, $4, $5)`,
            [
                idRol,
                nombres,
                apellidos,
                correo,
                passwordHash
            ]
        );
        console.log('Administrador creado correctamente');
    }catch(error){
        console.error('Error al crear administrador:',error.message);
        process.exitCode = 1;
    }finally{
        await pool.end();
    }
};

crearAdministrador();