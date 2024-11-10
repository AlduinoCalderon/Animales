const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');

// Definir las rutas correctamente
router.get('/', personController.getAllPersons);  // Asegúrate de que la función esté definida en el controlador
router.get('/:id', personController.getPersonById);
router.post('/', personController.createPerson);
router.put('/:id', personController.updatePerson);
router.delete('/:id', personController.deletePerson);

module.exports = router;
