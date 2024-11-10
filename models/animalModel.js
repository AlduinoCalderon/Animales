const db = require('../database/neo4j');

class Animal {
    static async createAnimal(animalData) {
        const session = db.driver.session();
        try {
            const result = await session.run(
                `CREATE (a:Animal {
                    id_animal: randomUUID(),
                    species: $species,
                    name: $name,
                    birth_year: $birth_year,
                    sterilized: $sterilized,
                    description: $description,
                    image: $image,
                    is_deleted: false
                 }) RETURN a`,
                {
                    species: animalData.species,
                    name: animalData.name,
                    birth_year: animalData.birth_year,
                    sterilized: animalData.sterilized,
                    description: animalData.description,
                    image: animalData.image || null,
                }
            );
            return result.records[0].get('a').properties;
        } finally {
            session.close();
        }
    }

    static async getAllAnimals() {
        const session = db.driver.session();
        try {
            const result = await session.run('MATCH (a:Animal) WHERE a.is_deleted = false RETURN a');
            return result.records.map(record => record.get('a').properties);
        } finally {
            session.close();
        }
    }

    static async getAnimalById(animalId) {
        const session = db.driver.session();
        try {
            const result = await session.run(
                `MATCH (a:Animal {id_animal: $animalId}) WHERE a.is_deleted = false RETURN a`,
                { animalId }
            );
            return result.records.length ? result.records[0].get('a').properties : null;
        } finally {
            session.close();
        }
    }

    static async deleteAnimal(animalId) {
        const session = db.driver.session();
        try {
            const result = await session.run(
                `MATCH (a:Animal {id_animal: $animalId}) SET a.is_deleted = true RETURN a`,
                { animalId }
            );
            return result.records.length ? result.records[0].get('a').properties : null;
        } finally {
            session.close();
        }
    }

    static async updateAnimal(animalId, animalData) {
        const session = db.driver.session();
        try {
            const result = await session.run(
                `MATCH (a:Animal {id_animal: $animalId}) 
                 SET a.species = $species, a.name = $name, a.birth_year = $birth_year, 
                     a.sterilized = $sterilized, a.description = $description, a.image = $image
                 RETURN a`,
                {
                    animalId,
                    species: animalData.species,
                    name: animalData.name,
                    birth_year: animalData.birth_year,
                    sterilized: animalData.sterilized,
                    description: animalData.description,
                    image: animalData.image || null
                }
            );
            return result.records.length ? result.records[0].get('a').properties : null;
        } finally {
            session.close();
        }
    }
}

module.exports = Animal;
