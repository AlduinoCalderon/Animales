const neo4j = require('neo4j-driver');
require('dotenv').config(); // Para cargar las variables de entorno
// Verificar si las variables de entorno de dotenv están definidas
console.log(
    process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD 
    ? "Accediendo con configuración desde dotenv" 
    : "No tiene acceso a dotenv"
  );
  
  // Imprimir las variables de entorno si están definidas
  if (process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD) {
    console.log("Server URI :", process.env.NEO4J_URI);  // Debería mostrar 'bolt://127.0.0.1'
    console.log("Database :", process.env.NEO4J_USER); // Debería mostrar 'neo4j'
    console.log("Password :", process.env.NEO4J_PASSWORD);  // Debería mostrar la contraseña configurada
  } else {
    console.log("Las variables de entorno no están configuradas correctamente.");
  }
  // Esto debe mostrar '12345678'

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
