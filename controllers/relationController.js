const driver = require('../database/neo4j'); 

// Crear relación
const createRelation = async (req, res) => {
    const session = driver.session();
    console.log('Entrando en createRelation'); 
    const { userId, animalId, relationType, relationData } = req.body;

    // Imprimir los datos recibidos en la solicitud.
    console.log('Datos recibidos:', { userId, animalId, relationType, relationData });

    const allowedRelations = ['ADOPTED', 'RESCUED', 'SPONSORED', 'TEMPORARY_CARE', 'VETERINARIAN'];

    // Validación de tipo de relación
    if (!allowedRelations.includes(relationType)) {
        console.log('Tipo de relación no válido');
        return res.status(400).json({ message: 'Tipo de relación no válido' });
    }

    try {
        // Verificar que relationData es un objeto
        if (typeof relationData !== 'object' || relationData === null) {
            console.log('relationData no es un objeto válido', relationData);
            return res.status(400).json({ message: 'relationData debe ser un objeto válido' });
        }

        // Formatear relationData para Cypher
        const formattedRelationData = Object.keys(relationData)
            .map(key => `${key}: "${relationData[key]}"`)
            .join(', ');

        console.log('Datos formateados para Cypher:', formattedRelationData);

        // Ejecutar la consulta con MERGE
        const result = await session.run(
            `MATCH (p:Person {id: $userId}), (a:Animal {id_animal: $animalId}) 
             MERGE (p)-[:${relationType} {${formattedRelationData}}]->(a)`,
            { userId, animalId, relationType, relationData }
        );

        // Imprimir el resultado de la consulta
        console.log('Resultado de la consulta:', result);

        res.status(201).json({
            message: 'Relación creada exitosamente',
            data: result.records
        });
    } catch (error) {
        console.error('Error al crear la relación:', error);
        res.status(500).json({ message: 'Error creando la relación' });
    }finally {
        await session.close();
    }
};
// Leer relación
const getRelation = async (req, res) => {
    const session = driver.session();
    const { userId, animalId, relationType } = req.params;

    try {
        const result = await session.run(
            `MATCH (p:Person {id: $userId})-[r:${relationType}]-(a:Animal {id_animal: $animalId}) 
             RETURN p, r, a`,
            { userId, animalId, relationType }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        res.status(200).json({
            message: 'Relación encontrada',
            data: result.records
        });
    } catch (error) {
        console.error('Error retrieving relation:', error);
        res.status(500).json({ message: 'Error retrieving relation' });
    }finally {
        await session.close();
    }
};
// Actualizar relación
const updateRelation = async (req, res) => {
    const session = driver.session();
    const { userId, animalId, oldRelationType } = req.params;
    const { relationType, relationData } = req.body;
    const allowedRelations = ['ADOPTED', 'RESCUED', 'SPONSORED', 'TEMPORARY_CARE', 'VETERINARIAN'];

    // Validación de tipo de relación
    if (!allowedRelations.includes(relationType)) {
        console.log('Tipo de relación no válido');
        return res.status(400).json({ message: 'Tipo de relación no válido' });
    }

    // Validar que relationData sea un objeto
    if (typeof relationData !== 'object' || relationData === null) {
        console.log('relationData no es un objeto válido', relationData);
        return res.status(400).json({ message: 'relationData debe ser un objeto válido' });
    }

    // Formatear relationData para Cypher
    const formattedRelationData = Object.keys(relationData)
        .map(key => `${key}: "${relationData[key]}"`)
        .join(', ');
    const tx = session.beginTransaction(); // Iniciar transacción

    try {
        // Eliminar relación anterior si el tipo cambió
    if ((oldRelationType)&& oldRelationType !== relationType) {
            await tx.run(
                `MATCH (p:Person {id: $userId})-[r:${oldRelationType}]->(a:Animal {id_animal: $animalId}) DELETE r`,
                { userId, animalId }
            );
        }

        // Crear o actualizar la relación nueva
        const result = await tx.run(
            `MATCH (p:Person {id: $userId}), (a:Animal {id_animal: $animalId}) 
             MERGE (p)-[r:${relationType} {${formattedRelationData}}]->(a)
             RETURN p, a;`,
            { userId, animalId }
        );

        await tx.commit(); // Confirmar la transacción

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        res.status(200).json({
            message: 'Relación actualizada exitosamente',
            data: result.records
        });
    } catch (error) {
        await tx.rollback(); // Revertir cambios en caso de error
        console.error('Error updating relation:', error);
        res.status(500).json({ message: 'Error updating relation' });
    } finally {
        session.close(); // Cerrar la sesión
    }
};
const getAnimalRelations = async (req, res) => {
    const session = driver.session();
    const { animalId } = req.params;

    try {
        const result = await session.run(
            'MATCH (a:Animal {id_animal: $animalId})<-[r]-(p:Person) RETURN r, p', 
            { animalId }  // Usamos parámetros para evitar la inyección
        );

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'No se encontraron relaciones para este animal' });
        }

        const relations = result.records.map(record => {
            return {
                relationType: record.get('r').type,
                relationData: record.get('r').properties,
                person: record.get('p').properties
            };
        });

        res.status(200).json({
            message: 'Relaciones obtenidas correctamente',
            data: relations
        });
    } catch (error) {
        console.error('Error al obtener relaciones:', error);
        res.status(500).json({ message: 'Error obteniendo relaciones' });
    }finally {
        await session.close();
    }
};
// Eliminar relación
const deleteRelation = async (req, res) => {
    const session = driver.session();
    const { userId, animalId, relationType } = req.params;

    try {
        const result = await session.run(
            `MATCH (p:Person {id: $userId})-[r:${relationType}]-(a:Animal {id_animal: $animalId}) 
             DELETE r`,
            { userId, animalId, relationType }
        );

        if (result.summary.counters.updates().relationshipsDeleted === 0) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        res.status(200).json({
            message: 'Relación eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error deleting relation:', error);
        res.status(500).json({ message: 'Error deleting relation' });
    }finally {
        await session.close();
    }
};
// Este es un ejemplo general usando Neo4j
// Modifica la función getAnimalRelationsCount
const getPersonRelations = async (req, res) => {
    const session = driver.session();
    const { personId } = req.params; // Corrección aquí

    try {
        const result = await session.run(
            'MATCH (a:Animal)-[r]-(p:Person {id: $personId}) RETURN a, r',
            { personId }  
        );

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'No se encontraron relaciones para esta persona' });
        }

        const relations = result.records.map(record => {
            return {
                relationType: record.get('r').type,
                relationData: record.get('r').properties,
                animal: record.get('a').properties
            };
        });

        res.status(200).json({
            message: 'Relaciones obtenidas correctamente',
            data: relations
        });
    } catch (error) {
        console.error('Error al obtener relaciones:', error);
        res.status(500).json({ message: 'Error obteniendo relaciones' });
    } finally {
        await session.close();
    }
};



// Exportar funciones
module.exports = {
    createRelation,
    getAnimalRelations,
    getPersonRelations,
    getRelation,
    updateRelation,
    deleteRelation
};
