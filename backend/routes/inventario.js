const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventarioController');

router.get('/',           ctrl.getInventario);
router.get('/movimientos', ctrl.getMovimientos);
router.put('/:producto_id', ctrl.updateStock);
router.post('/movimiento',  ctrl.registrarMovimiento);


module.exports = router;