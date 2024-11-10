const neo4j = require('neo4j-driver');
require('dotenv').config(); // Para cargar las variables de entorno

console.log(process.env.NEO4J_URI);  // Esto debe mostrar 'bolt://127.0.0.1'
console.log(process.env.NEO4J_USER); // Esto debe mostrar 'neo4j'
console.log(process.env.NEO4J_PASSWORD); // Esto debe mostrar '12345678'

// Crear un driver utilizando las variables de entorno o valores por defecto
const driver = neo4j.driver(
    process.env.NEO4J_URI || 'neo4j://127.0.0.1', // Usar el protocolo cifrado
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',  // Usuario desde archivo .env o valor por defecto
        process.env.NEO4J_PASSWORD || '12345678' // Contraseña desde archivo .env o valor por defecto
    ),
    { encrypted: 'ENCRYPTION_ON' }  // Activar cifrado en la conexión
);

// Exportar el driver para usarlo en otras partes de la aplicación
module.exports = driver;
