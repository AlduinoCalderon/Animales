const neo4j = require('neo4j-driver');  // Cambié aquí para usar la nueva versión

// Crear una conexión a Neo4j
const driver = neo4j.driver(
    'bolt://localhost', 
    neo4j.auth.basic('neo4j', 'password')  // Credenciales de conexión
);

const session = driver.session();  // Crear una nueva sesión

// Obtener una persona por ID (solo no eliminadas)
// Obtener una persona por ID (solo no eliminadas)
const getPersonById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await session.run(
            'MATCH (p:Person {id: $id}) RETURN p',
            { id }
        );
        if (result.records.length === 0) {
            return res.status(404).json({ error: 'Person not found' });  // Asegúrate de usar status primero
        }
        const person = result.records[0].get('p').properties;
        res.status(200).json(person);  // Devolver los datos de la persona en formato JSON
    } catch (error) {
        console.error('Error retrieving person by id:', error);
        res.status(500).json({ error: 'Error retrieving person by id' });  // Asegúrate de usar status primero
    }
};


// Obtener todas las personas (solo no eliminadas)
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
        res.json(persons);  // Devolver la lista de personas en formato JSON
    } catch (error) {
        console.error('Error retrieving persons:', error);
        res.status(500).json({ error: 'Error retrieving persons' });
    }
};

// Crear una persona
const createPerson = async (req, res) => {
    const { id, first_name, last_name, mother_last_name, address, phone, email } = req.body;
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

// Actualizar persona
const updatePerson = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, mother_last_name, address, phone, email } = req.body;
    try {
        const result = await session.run(
            'MATCH (p:Person {id: $id, deleted: false}) SET p.first_name = $first_name, p.last_name = $last_name, p.mother_last_name = $mother_last_name, p.address = $address, p.phone = $phone, p.email = $email RETURN p',
            { id, first_name, last_name, mother_last_name, address, phone, email }
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

// Eliminar persona (borrado lógico)
const deletePerson = async (req, res) => {
    const { id } = req.params;
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
