const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pedidosController');

router.get('/',         ctrl.getPedidos);
router.get('/:id',      ctrl.getPedidoById);
router.post('/',        ctrl.createPedido);
router.put('/:id',      ctrl.updateEstado);
router.delete('/:id',   ctrl.deletePedido);

module.exports = router;