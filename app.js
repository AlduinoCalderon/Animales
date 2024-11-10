const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const neo4j = require('./database/neo4j');  // Importar el driver de la base de datos
const personRoutes = require('./routes/personRoutes');
const animalRoutes = require('./routes/animalRoutes');
require('dotenv').config();  // Para cargar las variables de entorno desde un archivo .env

const app = express();

// Middleware
app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Crear una nueva sesión con el driver de Neo4j
let session;
try {
    session = neo4j.session();  // Usar el método session() desde el archivo neo4j.js
    console.log('Conexión exitosa a Neo4j');
} catch (error) {
    console.error('Error al conectar a Neo4j:', error);
}

// Guardar la sesión en las variables locales para acceso global
app.locals.session = session;

// Usar las rutas
app.use('/persons', personRoutes);
app.use('/animals', animalRoutes);
app.get('/', (req, res) => {
    res.redirect('/persons');
});

// Manejo de errores globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// Cerrar la sesión y el controlador de Neo4j cuando el servidor se apague
process.on('SIGINT', () => {
    if (session) {
        session.close();
    }
    neo4j.close();  // Cerrar la conexión al controlador de Neo4j
    console.log('Conexión a Neo4j cerrada');
    process.exit(0);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = app;
