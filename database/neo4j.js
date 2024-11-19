const neo4j = require('neo4j-driver');
require('dotenv').config();

// Verificar si las variables de entorno de dotenv están definidas
console.log(
    process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD 
        ? "Accediendo con configuración desde dotenv" 
        : "No tiene acceso a dotenv"
);

// Imprimir las variables de entorno si están definidas
if (process.env.NEO4J_URI && process.env.NEO4J_USER && process.env.NEO4J_PASSWORD) {
    console.log("Server URI :", process.env.NEO4J_URI);
    console.log("Database :", process.env.NEO4J_USER); 
    console.log("Password :", process.env.NEO4J_PASSWORD);  
} else {
    console.log("Las variables de entorno no están configuradas correctamente.");
}

// Crear un driver utilizando las variables de entorno
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(
        process.env.NEO4J_USER,
        process.env.NEO4J_PASSWORD 
    )
);

// Exportar el driver para usarlo en otras partes de la aplicación
module.exports = driver;

// Función para probar la conexión
async function testConnection() {
    const session = driver.session();

    try {
        const result = await session.run('MATCH (a:Animal)<-[r]-(p:Person) RETURN a.name, type(r) AS relationshipType, p.first_name LIMIT 1');
        console.log('Resultado de prueba:', result.records);
    } catch (error) {
        console.error('Error ejecutando consulta de prueba:', error);
    } finally {
        await session.close();
    }
}

// Llamar a la función de prueba
testConnection();
