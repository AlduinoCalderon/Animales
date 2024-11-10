const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const personRoutes = require('../routes/personRoutes');
const animalRoutes = require('../routes/animalRoutes');
const relationRoutes = require('../routes/relationRoutes');
const neo4j = require('../database/neo4j'); // Conexión a Neo4j

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000; // Puerto configurable desde el .env
        this.fnConecta();
        this.middleware();
        this.routes();
        this.handleErrors();
        this.handleShutdown();
    }
    handleErrors() {
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Algo salió mal!');
        });
    }

    // Cerrar la sesión y la conexión de Neo4j cuando el servidor se apague
    handleShutdown() {
        process.on('SIGINT', () => {
            if (this.app.locals.session) {
                this.app.locals.session.close();
                console.log('Sesión de Neo4j cerrada');
            }
            if (neo4j) {
                neo4j.close();  // Cerrar la conexión al controlador de Neo4j
                console.log('Conexión a Neo4j cerrada');
            }
            process.exit(0);
        });
    }
    async fnConecta() {
        // Configura la conexión a Neo4j
        let session;
        try {
            session = neo4j.session();
            console.log('Conexión exitosa a Neo4j');
            this.app.locals.session = session; // Guardar la sesión para uso global
        } catch (error) {
            console.error('Error al conectar a Neo4j:', error);
        }
    }

    middleware() {
        // Configurar middlewares
        this.app.use(cors());
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    routes() {
        // Definir rutas
        this.app.use('/persons', personRoutes);
        this.app.use('/animals', animalRoutes);
        this.app.use('/relations', relationRoutes);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`);
        });
    }
}

module.exports = Server;
