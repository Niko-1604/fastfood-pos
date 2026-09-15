const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const verificarToken = require('../middlewares/authMiddleware');

// 1. Ruta específica PRIMERO (Evita que /:id la sombree)
router.put('/perfil/password', verificarToken, usuariosController.actualizarPassword);

// 2. Rutas dinámicas y de administración DESPUÉS
router.get('/', verificarToken, usuariosController.getUsuarios);
router.get('/:id', verificarToken, usuariosController.getUsuarioById);
router.put('/:id', verificarToken, usuariosController.actualizarUsuario);
router.delete('/:id', verificarToken, usuariosController.eliminarUsuario);

module.exports = router;