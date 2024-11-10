const session = require('neo4j-driver').v1.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'password')).session();

// Obtener una persona por ID (solo no eliminadas)
const getPersonById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await session.run(
            'MATCH (p:Person {id: $id, deleted: false}) RETURN p',
            { id }
        );
        if (result.records.length === 0) {
            return res.status(404).send('Person not found');
        }
        const person = result.records[0].get('p').properties;
        res.render('personDetail', { person });  // Asegúrate de tener una vista `personDetail` para mostrar los detalles
    } catch (error) {
        console.error('Error retrieving person by id:', error);
        res.status(500).send('Error retrieving person by id');
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
        res.redirect('/'); // Redirigir a la lista de personas
    } catch (error) {
        console.error('Error creating person:', error);
        res.status(500).send('Error creating person');
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
            return res.status(404).send('Person not found');
        }
        res.redirect('/'); // Redirigir a la lista de personas
    } catch (error) {
        console.error('Error updating person:', error);
        res.status(500).send('Error updating person');
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
            return res.status(404).send('Person not found');
        }
        res.redirect('/'); // Redirigir a la lista de personas
    } catch (error) {
        console.error('Error deleting person:', error);
        res.status(500).send('Error deleting person');
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
        res.render('index', { persons });
    } catch (error) {
        console.error('Error retrieving persons:', error);
        res.status(500).send('Error retrieving persons');
    }
};

module.exports = {
    createPerson, 
    getPersonById,
    updatePerson,
    deletePerson,
    getAllPersons
};
