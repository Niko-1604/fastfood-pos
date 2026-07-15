const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/menuController');
const upload = require('../config/upload');

router.get('/', ctrl.getProductos);

router.get('/categorias', ctrl.getCategorias);

router.post('/categorias', ctrl.createCategoria);

router.get('/:id', ctrl.getProductoById);

router.post(
    '/',
    upload.single('imagen'),
    ctrl.createProducto
);

router.put(
    '/:id',
    upload.single('imagen'),
    ctrl.updateProducto
);

router.delete('/:id', ctrl.deleteProducto);

module.exports = router;