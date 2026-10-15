const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const pool = require('./config/database');

const app = express();
const PORT = 3000;

// Permitir solicitudes desde live server con cookies
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));

app.use(express.json());

// Configurar sesiones
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60
    }
}));

app.get('/', (req,res) => {
    res.json({
        mensaje: 'Servidor ATEDA funcionando correctamente'
    });
});
// Autenticacion - HU-001
app.use('/api/auth', authRoutes);
// Gestión de usuarios - HU-002
app.use('/api/usuarios', usuarioRoutes);

const iniciarServidor = async () =>{

    try{
        if (!process.env.SESSION_SECRET){
            throw new Error('Falta SESSION_SECRET en .env');
        }

        await pool.query('SELECT 1');
        console.log('Conexión con PostgreSQL establecida');

        app.listen(PORT, () =>{
            console.log(`Servidor ATEDA ejecutándose en http://localhost:${PORT}`);
        });
    }catch(error){
        console.error('Error al iniciar servidor:',error.message);
        process.exitcode = 1;
        await pool.end();
    }
};

iniciarServidor();