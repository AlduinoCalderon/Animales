const neo4j = require('neo4j-driver');
const { v4: uuidv4 } = require('uuid');

const driver = neo4j.driver(
    'bolt://localhost',
    neo4j.auth.basic('neo4j', 'password')
);

const session = driver.session();

// Obtener todos los animales
const getAllAnimals = async (req, res) => {
    try {
        const result = await session.run('MATCH (a:Animal) RETURN a');
        const animals = result.records.map(record => ({
            id: record.get('a').properties.id_animal,
            species: record.get('a').properties.species,
            name: record.get('a').properties.name,
            birth_year: record.get('a').properties.birth_year,
            sterilized: record.get('a').properties.sterilized,
            photo: record.get('a').properties.photo
        }));
        res.json(animals);
    } catch (error) {
        console.error('Error retrieving animals:', error);
        res.status(500).json({ error: 'Error retrieving animals' });
    }
};

// Obtener un animal por ID
const getAnimalById = async (req, res) => {
    const id = req.params.id; // UUID no necesita parseInt
    try {
        const result = await session.run('MATCH (a:Animal {id_animal: $id}) RETURN a', { id });
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Animal not found' });
        }
        const animal = result.records[0].get('a').properties;
        res.json(animal);
    } catch (error) {
        console.error('Error retrieving animal by id:', error);
        res.status(500).json({ error: 'Error retrieving animal by id' });
    }
};

// Crear un animal
const createAnimal = async (req, res) => {
    const { species, name, birth_year, sterilized, photo } = req.body;
    const id_animal = uuidv4();  // Generar UUID
    try {
        const result = await session.run(
            'CREATE (a:Animal {id_animal: $id_animal, species: $species, name: $name, birth_year: $birth_year, sterilized: $sterilized, photo: $photo, deleted: false}) RETURN a',
            { id_animal, species, name, birth_year, sterilized, photo }
        );
        res.status(201).json({ message: 'Animal created', id_animal });
    } catch (error) {
        console.error('Error creating animal:', error);
        res.status(500).json({ error: 'Error creating animal' });
    }
};

// Actualizar un animal parcialmente
const updateAnimal = async (req, res) => {
    const id_animal = req.params.id; // UUID no necesita parseInt
    const { species, name, birth_year, sterilized, photo, deleted } = req.body;
    const setStatements = [];
    const params = { id_animal };

    if (deleted !== undefined) {
        setStatements.push('a.deleted = $deleted');
        params.deleted = deleted;
    }
    if (species) {
        setStatements.push('a.species = $species');
        params.species = species;
    }
    if (name) {
        setStatements.push('a.name = $name');
        params.name = name;
    }
    if (birth_year) {
        setStatements.push('a.birth_year = $birth_year');
        params.birth_year = birth_year;
    }
    if (sterilized !== undefined) {
        setStatements.push('a.sterilized = $sterilized');
        params.sterilized = sterilized;
    }
    if (photo) {
        setStatements.push('a.photo = $photo');
        params.photo = photo;
    }

    if (setStatements.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    try {
        const result = await session.run(
            `MATCH (a:Animal {id_animal: $id_animal}) SET ${setStatements.join(', ')} RETURN a`,
            params
        );
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Animal not found' });
        }
        res.json({ message: 'Animal updated', id_animal });
    } catch (error) {
        console.error('Error updating animal:', error);
        res.status(500).json({ error: 'Error updating animal' });
    }
};

// Eliminar un animal (marcar como eliminado)
const deleteAnimal = async (req, res) => {
    const id_animal = req.params.id; // UUID no necesita parseInt
    try {
        const result = await session.run(
            'MATCH (a:Animal {id_animal: $id_animal, deleted: false}) SET a.deleted = true RETURN a',
            { id_animal }
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
    getAnimalById,
    updateAnimal,
    deleteAnimal,
    getAllAnimals
};
