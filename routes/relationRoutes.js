const express = require('express');
const router = express.Router();
const relationController = require('../controllers/relationController');

// Crear relación
router.post('/', relationController.createRelation);
// Obtener relación (por usuario, animal y tipo de relación)
router.get('/:userId/:animalId/:relationType', relationController.getRelation);
// Actualizar relación
router.put('/:userId/:animalId/:relationType', relationController.updateRelation);
// Eliminar relación
router.delete('/:userId/:animalId/:relationType', relationController.deleteRelation);
// Obtener todas las relaciones de un animal
router.get('/:animalId', relationController.getAnimalRelations);

router.get('person/:personId', relationController.getPersonRelations);

module.exports = router;
