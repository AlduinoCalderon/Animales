const express = require('express');
const router = express.Router();
const relationController = require('../controllers/relationController');

// Crear relación
router.post('/', relationController.createRelation);
// Obtener relación
router.get('/:userId/:animalId/:relationType', relationController.getRelation);
// Actualizar relación
router.put('/:userId/:animalId/:relationType', relationController.updateRelation);
// Eliminar relación
router.delete('/:userId/:animalId/:relationType', relationController.deleteRelation);

module.exports = router;
