const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientesController');

router.get('/',                ctrl.getClientes);
router.get('/buscar/:cedula',  ctrl.getClienteByCedula);
router.get('/:id',             ctrl.getClienteById);
router.post('/',     ctrl.createCliente);
router.put('/:id',   ctrl.updateCliente);
router.delete('/:id',ctrl.deleteCliente);

module.exports = router;