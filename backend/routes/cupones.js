const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/cuponesController');
const soloAdmin = require('../middlewares/soloAdmin');

// El token ya se valida al montar la ruta en server.js.

// Validar un cupón: cualquier usuario autenticado (lo usa el cajero en el POS)
router.get('/validar/:codigo', ctrl.validarCupon);

// Gestión de cupones: solo admin
router.get('/', soloAdmin, ctrl.getCupones);
router.post('/', soloAdmin, ctrl.createCupon);
router.put('/:id', soloAdmin, ctrl.updateCupon);
router.delete('/:id', soloAdmin, ctrl.deleteCupon);

module.exports = router;
