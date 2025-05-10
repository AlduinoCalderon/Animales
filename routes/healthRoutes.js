const express = require('express');
const router = express.Router();
const neo4j = require('../database/neo4j');

// Ruta para verificar la salud de la API
router.get('/health', async (req, res) => {
    try {
        const session = neo4j.session();
        const timestamp = new Date().toISOString();
        
        // Verificar la conexión a Neo4j
        const result = await session.run('RETURN 1 as test');
        
        // Eliminar el nodo de salud anterior
        await session.run('MATCH (h:Health) DELETE h');
        
        // Crear un nuevo nodo de salud
        await session.run(
            'CREATE (h:Health {timestamp: $timestamp, status: "healthy"})',
            { timestamp }
        );
        
        await session.close();
        
        res.json({
            status: 'healthy',
            timestamp,
            database: 'connected',
            message: 'API is running properly'
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});

module.exports = router; 