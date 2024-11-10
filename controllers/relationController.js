const neo4j = require('neo4j-driver');
const driver = neo4j.driver(
    'bolt://localhost',
    neo4j.auth.basic('neo4j', 'password')
);
const session = driver.session();
// Crear relación
const createRelation = async (req, res) => {
    console.log('Entrando en createRelation'); 
    const { userId, animalId, relationType, relationData } = req.body;

    // Imprimir los datos recibidos en la solicitud
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
    }
};



// Leer relación
const getRelation = async (req, res) => {
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
    }
};

// Actualizar relación
const updateRelation = async (req, res) => {
    const { userId, animalId, relationType, relationData } = req.body;

    try {
        const result = await session.run(
            `MATCH (p:Person {id: $userId})-[r:${relationType}]-(a:Animal {id_animal: $animalId}) 
             SET r += $relationData 
             RETURN p, r, a`,
            { userId, animalId, relationType, relationData }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }

        res.status(200).json({
            message: 'Relación actualizada exitosamente',
            data: result.records
        });
    } catch (error) {
        console.error('Error updating relation:', error);
        res.status(500).json({ message: 'Error updating relation' });
    }
};

// Eliminar relación
const deleteRelation = async (req, res) => {
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
    }
};

// Exportar funciones
module.exports = {
    createRelation,
    getRelation,
    updateRelation,
    deleteRelation
};
