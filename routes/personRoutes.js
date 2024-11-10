const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');

// Rutas para el CRUD de Person
router.get('/', personController.getAllPeople); // Cambié el nombre a 'getAllPeople' para mantener la coherencia con tu controlador
router.get('/:id', personController.getPersonById); // Obtener persona por ID
router.post('/', personController.createPerson); // Crear una nueva persona
router.put('/:id', personController.updatePerson); // Actualizar persona por ID
router.delete('/:id', personController.deletePerson); // Eliminar persona por ID

module.exports = router;
