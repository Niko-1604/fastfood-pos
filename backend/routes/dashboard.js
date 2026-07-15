const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');

router.get('/resumen',        ctrl.getResumen);
router.get('/ventas-semana',  ctrl.getVentasSemana);
router.get('/ventas-mes',     ctrl.getVentasMes);
router.get('/top-productos',  ctrl.getTopProductos);
router.get('/pedidos-estado', ctrl.getPedidosPorEstado);

module.exports = router;