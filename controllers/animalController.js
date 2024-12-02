const driver = require('../database/neo4j'); // Importa el driver configurado
const { v4: uuidv4 } = require('uuid');

// Obtener todos los animales
const getAllAnimals = async (req, res) => {
    const session = driver.session(); // Crea una nueva sesión
    try {
        const result = await session.run('MATCH (a:Animal) where a.deleted = false RETURN a');
        const animals = result.records.map(record => ({
            id: record.get('a').properties.id_animal,
            species: record.get('a').properties.species,
            name: record.get('a').properties.name,
            birth_year: record.get('a').properties.birth_year,
            sterilized: record.get('a').properties.sterilized,
            photo: record.get('a').properties.photo,
        }));
        res.json(animals);
    } catch (error) {
        console.error('Error retrieving animals:', error);
        res.status(500).json({ error: 'Error retrieving animals' });
    } finally {
        await session.close(); // Cierra la sesión
    }
};

// Obtener un animal por ID
const getAnimalById = async (req, res) => {
    const session = driver.session();
    const id = req.params.id;
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
    } finally {
        await session.close();
    }
};

// Crear un animal
const createAnimal = async (req, res) => {
    const session = driver.session();
    const { species, name, birth_year, sterilized, photo } = req.body;
    const id_animal = uuidv4();
    try {
        await session.run(
            'CREATE (a:Animal {id_animal: $id_animal, species: $species, name: $name, birth_year: $birth_year, sterilized: $sterilized, photo: $photo, deleted: false}) RETURN a',
            { id_animal, species, name, birth_year, sterilized, photo }
        );
        res.status(201).json({ message: 'Animal created', id_animal });
    } catch (error) {
        console.error('Error creating animal:', error);
        res.status(500).json({ error: 'Error creating animal' });
    } finally {
        await session.close();
    }
};

// Actualizar un animal parcialmente
const updateAnimal = async (req, res) => {
    const session = driver.session();
    const id_animal = req.params.id;
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
    } finally {
        await session.close();
    }
};

// Eliminar un animal (lógico)
const deleteAnimal = async (req, res) => {
    const session = driver.session();
    const id_animal = req.params.id;
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
    } finally {
        await session.close();
    }
};

module.exports = {
    createAnimal,
    getAnimalById,
    updateAnimal,
    deleteAnimal,
    getAllAnimals,
};
