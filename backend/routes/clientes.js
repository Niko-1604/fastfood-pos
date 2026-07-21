const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientesController');
const soloAdmin = require('../middlewares/soloAdmin');

// El token ya se valida al montar la ruta en server.js.
router.get('/',                ctrl.getClientes);
router.get('/buscar/:cedula',  ctrl.getClienteByCedula);
router.get('/:id',             ctrl.getClienteById);
router.post('/',     ctrl.createCliente);
router.put('/:id',   ctrl.updateCliente);
router.delete('/:id', soloAdmin, ctrl.deleteCliente); // eliminar: solo admin

module.exports = router;