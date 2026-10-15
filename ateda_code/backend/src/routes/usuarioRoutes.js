const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const { requiereAdministrador } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(requiereAdministrador);

router.get('/roles', usuarioController.listarRoles);
router.get('/', usuarioController.listarUsuarios);
router.get('/:id', usuarioController.buscarUsuarios);

router.post('/', usuarioController.crearUsuario);

router.put('/:id', usuarioController.modificarUsuario);
router.patch('/:id/estado', usuarioController.cambiarEstadoUsuario);

module.exports = router;