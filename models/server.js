const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const personRoutes = require('../routes/personRoutes').default;
const animalRoutes = require('../routes/animalRoutes').default;
const relationRoutes = require('../routes/relationRoutes').default;
const app = express();

// Middleware
app.use(cors()); // Permite el uso de CORS, para permitir que el frontend acceda al backend
app.use(logger('dev')); // Utiliza morgan para registrar las peticiones HTTP en la consola
app.use(bodyParser.json()); // Middleware para parsear las peticiones JSON
app.use(bodyParser.urlencoded({ extended: false })); // Middleware para parsear los datos de formularios URL-encoded
app.use(cookieParser()); // Middleware para manejar cookies
app.use(express.static(path.join(__dirname, '../public'))); // Permite servir archivos estáticos como imágenes, CSS, etc.

// Configuración de vistas
app.set('views', path.join(__dirname, '../views')); // Define el directorio donde se encuentran las vistas
app.set('view engine', 'ejs'); // Establece EJS como el motor de plantillas

// Rutas
app.use('/persons', personRoutes); // Ruta para gestionar personas
app.use('/animals', animalRoutes); // Ruta para gestionar animales
app.use('/relations', relationRoutes);
// Iniciar servidor
const PORT = process.env.PORT || 3000; // Se puede configurar el puerto desde una variable de entorno
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

module.exports = app;
