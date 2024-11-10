const neo4j = require('neo4j-driver');  // Cambié aquí para usar la nueva versión

// Crear una conexión a Neo4j
const driver = neo4j.driver(
    'bolt://localhost', 
    neo4j.auth.basic('neo4j', 'password')  // Credenciales de conexión
);

const session = driver.session();  // Crear una nueva sesión

// Obtener todos los animales (solo no eliminados)
const getAllAnimals = async (req, res) => {
    try {
        const result = await session.run('MATCH (a:Animal {deleted: false}) RETURN a');
        const animals = result.records.map(record => ({
            id_animal: record.get('a').properties.id_animal,
            species: record.get('a').properties.species,
            name: record.get('a').properties.name,
            birth_year: record.get('a').properties.birth_year,
            sterilized: record.get('a').properties.sterilized
        }));
        res.json(animals);  // Devolver la lista de animales en formato JSON
    } catch (error) {
        console.error('Error retrieving animals:', error);
        res.status(500).json({ error: 'Error retrieving animals' });
    }
};

// Obtener un animal por ID (solo no eliminados)
const getAnimalById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await session.run(
            'MATCH (a:Animal {id_animal: $id, deleted: false}) RETURN a',
            { id }
        );
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Animal not found' });
        }
        const animal = result.records[0].get('a').properties;
        res.json(animal);  // Devolver el animal en formato JSON
    } catch (error) {
        console.error('Error retrieving animal by id:', error);
        res.status(500).json({ error: 'Error retrieving animal by id' });
    }
};

// Crear un animal
const createAnimal = async (req, res) => {
    const { id_animal, species, name, birth_year, sterilized } = req.body;
    try {
        const result = await session.run(
            'CREATE (a:Animal {id_animal: $id_animal, species: $species, name: $name, birth_year: $birth_year, sterilized: $sterilized, deleted: false}) RETURN a',
            { id_animal, species, name, birth_year, sterilized }
        );
        res.status(201).json({ message: 'Animal created', id_animal });
    } catch (error) {
        console.error('Error creating animal:', error);
        res.status(500).json({ error: 'Error creating animal' });
    }
};

// Actualizar animal
const updateAnimal = async (req, res) => {
    const { id } = req.params;
    const { species, name, birth_year, sterilized } = req.body;
    try {
        const result = await session.run(
            'MATCH (a:Animal {id_animal: $id, deleted: false}) SET a.species = $species, a.name = $name, a.birth_year = $birth_year, a.sterilized = $sterilized RETURN a',
            { id, species, name, birth_year, sterilized }
        );
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Animal not found' });
        }
        res.json({ message: 'Animal updated', id });
    } catch (error) {
        console.error('Error updating animal:', error);
        res.status(500).json({ error: 'Error updating animal' });
    }
};

// Eliminar animal (borrado lógico)
const deleteAnimal = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await session.run(
            'MATCH (a:Animal {id_animal: $id, deleted: false}) SET a.deleted = true RETURN a',
            { id }
        );
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Animal not found' });
        }
        res.json({ message: 'Animal deleted' });
    } catch (error) {
        console.error('Error deleting animal:', error);
        res.status(500).json({ error: 'Error deleting animal' });
    }
};

module.exports = {
    createAnimal,
    getAllAnimals,
    getAnimalById,
    updateAnimal,
    deleteAnimal
};
