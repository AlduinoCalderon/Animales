// routes/animalRoutes.js
const express = require('express');
const router = express.Router(); // Usamos Router de express
const { getAllAnimals, getAnimalById, createAnimal, updateAnimal, deleteAnimal } = require('../controllers/animalController'); // Usamos require para importar las funciones

// Rutas para operaciones CRUD de Animal
router.get('/', getAllAnimals); // Obtener todos los animales
router.get('/:id', getAnimalById); // Obtener un animal por su ID
router.post('/', createAnimal); // Crear un animal
router.put('/:id', updateAnimal); // Actualizar un animal por ID
router.delete('/:id', deleteAnimal); // Eliminar un animal por ID

module.exports = router; // Exportamos el router
