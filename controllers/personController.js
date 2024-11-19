const { v4: uuidv4 } = require('uuid');
const driver = require('../database/neo4j');  // Importa el driver de la conexión

const session = driver.session();

// Obtener todas las personas
const getAllPersons = async (req, res) => {
    try {
        const result = await session.run('MATCH (p:Person {deleted: false}) RETURN p');
        const persons = result.records.map(record => ({
            id: record.get('p').properties.id,
            first_name: record.get('p').properties.first_name,
            last_name: record.get('p').properties.last_name,
            mother_last_name: record.get('p').properties.mother_last_name,
            address: record.get('p').properties.address,
            phone: record.get('p').properties.phone,
            email: record.get('p').properties.email
        }));
        res.json(persons);
    } catch (error) {
        console.error('Error retrieving persons:', error);
        res.status(500).json({ error: 'Error retrieving persons' });
    }
};

// Obtener una persona por ID
const getPersonById = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await session.run('MATCH (p:Person {id: $id}) RETURN p', { id });
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Person not found' });
        }
        const person = result.records[0].get('p').properties;
        res.json(person);
    } catch (error) {
        console.error('Error retrieving person by id:', error);
        res.status(500).json({ error: 'Error retrieving person by id' });
    }
};

// Crear una persona
const createPerson = async (req, res) => {
    const { first_name, last_name, mother_last_name, address, phone, email } = req.body;
    const id = uuidv4();
    try {
        const result = await session.run(
            'CREATE (p:Person {id: $id, first_name: $first_name, last_name: $last_name, mother_last_name: $mother_last_name, address: $address, phone: $phone, email: $email, deleted: false}) RETURN p',
            { id, first_name, last_name, mother_last_name, address, phone, email }
        );
        res.status(201).json({ message: 'Person created', id });
    } catch (error) {
        console.error('Error creating person:', error);
        res.status(500).json({ error: 'Error creating person' });
    }
};

// Actualizar una persona parcialmente
const updatePerson = async (req, res) => {
    const id = req.params.id;
    const { first_name, last_name, mother_last_name, address, phone, email, deleted } = req.body;
    const setStatements = [];
    const params = { id };

    if (first_name) {
        setStatements.push('p.first_name = $first_name');
        params.first_name = first_name;
    }
    if (last_name) {
        setStatements.push('p.last_name = $last_name');
        params.last_name = last_name;
    }
    if (mother_last_name) {
        setStatements.push('p.mother_last_name = $mother_last_name');
        params.mother_last_name = mother_last_name;
    }
    if (address) {
        setStatements.push('p.address = $address');
        params.address = address;
    }
    if (phone) {
        setStatements.push('p.phone = $phone');
        params.phone = phone;
    }
    if (email) {
        setStatements.push('p.email = $email');
        params.email = email;
    }
    if (deleted !== undefined) {
        setStatements.push('p.deleted = $deleted');
        params.deleted = deleted;
    }
    if (setStatements.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    try {
        const result = await session.run(
            `MATCH (p:Person {id: $id}) SET ${setStatements.join(', ')} RETURN p`,
            params
        );
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Person not found' });
        }
        res.json({ message: 'Person updated', id });
    } catch (error) {
        console.error('Error updating person:', error);
        res.status(500).json({ error: 'Error updating person' });
    }
};

// Eliminar una persona (marcar como eliminada)
const deletePerson = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await session.run(
            'MATCH (p:Person {id: $id, deleted: false}) SET p.deleted = true RETURN p',
            { id }
        );
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Person not found' });
        }
        res.json({ message: 'Person deleted' });
    } catch (error) {
        console.error('Error deleting person:', error);
        res.status(500).json({ error: 'Error deleting person' });
    }
};

module.exports = {
    createPerson,
    getPersonById,
    updatePerson,
    deletePerson,
    getAllPersons
};
