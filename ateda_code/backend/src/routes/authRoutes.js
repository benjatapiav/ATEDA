const express = require('express');

const { login, obtenerSesion } = require('../controllers/authController');
const { requiereAutenticacion } = require('../middlewares/authMiddleware');

const router = express.Router();
router.post('/login', login);
router.get('/sesion', requiereAutenticacion, obtenerSesion);

module.exports = router;