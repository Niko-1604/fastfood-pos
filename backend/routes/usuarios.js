const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/usuariosController');

router.get('/', ctrl.getUsuarios);
router.post('/', ctrl.createUsuario);
router.put('/:id/estado', ctrl.cambiarEstado);
router.put('/:id', ctrl.updateUsuario);
router.delete('/:id', ctrl.deleteUsuario);

module.exports = router;