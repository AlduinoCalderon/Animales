const db = require('../database/neo4j');

class Person {
    static async createPerson(personData) {
        const session = db.driver.session();
        try {
            const result = await session.run(
                `CREATE (p:Person {
                    id: randomUUID(),
                    first_name: $first_name,
                    last_name: $last_name,
                    mother_last_name: $mother_last_name,
                    address: $address,
                    phone: $phone,
                    email: $email,
                    profile_image: $profile_image,
                    is_deleted: false
                 }) RETURN p`,
                {
                    first_name: personData.first_name,
                    last_name: personData.last_name,
                    mother_last_name: personData.mother_last_name,
                    address: personData.address,
                    phone: personData.phone,
                    email: personData.email,
                    profile_image: personData.profile_image || null,
                }
            );
            return result.records[0].get('p').properties;
        } finally {
            session.close();
        }
    }

    static async getPersonById(personId) {
        const session = db.driver.session();
        try {
            const result = await session.run(
                `MATCH (p:Person {id: $personId}) WHERE p.is_deleted = false RETURN p`,
                { personId }
            );
            return result.records.length ? result.records[0].get('p').properties : null;
        } finally {
            session.close();
        }
    }

    static async getAllPeople() {
        const session = db.driver.session();
        try {
            const result = await session.run('MATCH (p:Person) WHERE p.is_deleted = false RETURN p');
            return result.records.map(record => record.get('p').properties);
        } finally {
            session.close();
        }
    }

    static async deletePerson(personId) {
        const session = db.driver.session();
        try {
            const result = await session.run(
                `MATCH (p:Person {id: $personId}) SET p.is_deleted = true RETURN p`,
                { personId }
            );
            return result.records.length ? result.records[0].get('p').properties : null;
        } finally {
            session.close();
        }
    }

    static async updatePerson(personId, personData) {
        const session = db.driver.session();
        try {
            const result = await session.run(
                `MATCH (p:Person {id: $personId}) 
                 SET p.first_name = $first_name, p.last_name = $last_name, p.mother_last_name = $mother_last_name, 
                     p.address = $address, p.phone = $phone, p.email = $email, p.profile_image = $profile_image
                 RETURN p`,
                {
                    personId,
                    first_name: personData.first_name,
                    last_name: personData.last_name,
                    mother_last_name: personData.mother_last_name,
                    address: personData.address,
                    phone: personData.phone,
                    email: personData.email,
                    profile_image: personData.profile_image || null
                }
            );
            return result.records.length ? result.records[0].get('p').properties : null;
        } finally {
            session.close();
        }
    }
}

module.exports = Person;
