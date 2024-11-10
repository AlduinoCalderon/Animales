const { Router } = require('express');
const router = Router(); 
const personController = require('../controllers/personController');

// Definir las rutas correctamente
router.get('/', personController.getAllPersons); 
router.get('/:id', personController.getPersonById);
router.post('/', personController.createPerson);
router.put('/:id', personController.updatePerson);
router.delete('/:id', personController.deletePerson);

module.exports = router;
