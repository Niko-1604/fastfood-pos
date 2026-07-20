const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/usuariosController');
const verificarToken = require('../middlewares/authMiddleware');
const soloAdmin = require('../middlewares/soloAdmin');

// Gestión de usuarios: solo administradores
router.get('/', verificarToken, soloAdmin, ctrl.getUsuarios);
router.post('/', verificarToken, soloAdmin, ctrl.createUsuario);

// Cambiar la propia contraseña: cualquier usuario autenticado
router.put('/perfil/password', verificarToken, ctrl.cambiarMiPassword);

router.put('/:id/estado', verificarToken, soloAdmin, ctrl.cambiarEstado);
router.put('/:id', verificarToken, soloAdmin, ctrl.updateUsuario);
router.delete('/:id', verificarToken, soloAdmin, ctrl.deleteUsuario);

module.exports = router;
