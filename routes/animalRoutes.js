// routes/animalRoutes.js
const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animalController');

// Rutas para operaciones CRUD de Animal
router.get('/', animalController.getAllAnimals); // Obtener todos los animales
router.get('/:id', animalController.getAnimalById); // Obtener un animal por su ID
router.post('/', animalController.createAnimal); // Crear un animal
router.put('/:id', animalController.updateAnimal); // Actualizar un animal por ID
router.delete('/:id', animalController.deleteAnimal); // Eliminar un animal por ID

module.exports = router;
