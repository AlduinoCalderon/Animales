const neo4j = require('neo4j-driver');
require('dotenv').config(); // Para cargar las variables de entorno

// Crear un driver utilizando las variables de entorno o valores por defecto
const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost', // Usa la URL de Neo4j desde el archivo .env o valor por defecto
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',  // Usuario desde archivo .env o valor por defecto
        process.env.NEO4J_PASSWORD || '12345678' // Contraseña desde archivo .env o valor por defecto
    )
);

// Exportar el driver para usarlo en otras partes de la aplicación
module.exports = driver;
