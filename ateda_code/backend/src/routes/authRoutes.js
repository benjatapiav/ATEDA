
const express = require('express');

const {
    login,
    obtenerSesion,
    cerrarSesion
} = require('../controllers/authController');

const { requiereAutenticacion } = require('../middlewares/authMiddleware');

const router = express.Router();

// HU-001: Iniciar sesión
router.post('/login', login);

// Consultar sesión activa
router.get('/sesion', requiereAutenticacion, obtenerSesion);

// HU-003: Cerrar sesión
router.post('/logout', requiereAutenticacion, cerrarSesion);

module.exports = router;
