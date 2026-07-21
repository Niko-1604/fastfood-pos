const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pedidosController');
const soloAdmin = require('../middlewares/soloAdmin');

// El token ya se valida al montar la ruta en server.js.
router.get('/',         ctrl.getPedidos);
router.get('/resumen',  ctrl.getResumen);
router.get('/:id',      ctrl.getPedidoById);
router.post('/',        ctrl.createPedido);
router.put('/:id',      ctrl.updateEstado);
router.delete('/:id',   soloAdmin, ctrl.deletePedido); // anular venta: solo admin

module.exports = router;