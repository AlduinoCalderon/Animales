// app.js
const Server = require('./models/server'); // Ruta al archivo Server.js

const serverExpress = new Server();
serverExpress.listen();  // Inicia el servidor
