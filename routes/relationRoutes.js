const express = require('express');
const router = express.Router();
const relationController = require('../controllers/relationController');

// Crear relación
router.post('/relations', relationController.createRelation);
// Obtener relación
router.get('/relations/:userId/:animalId/:relationType', relationController.getRelation);
// Actualizar relación
router.put('/relations', relationController.updateRelation);
// Eliminar relación
router.delete('/relations/:userId/:animalId/:relationType', relationController.deleteRelation);

export default router;
