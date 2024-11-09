var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const neo4j = require('neo4j-driver');
var addRouter = require('./person/add'); 
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "123"));
const session = driver.session();
app.get('/', function(req, res) {
    session
        .run("MATCH (n:Person) RETURN n")
        .then(function(result) {
            var personArr = [];
            result.records.forEach(function(record) {
                personArr.push({
                    id: record._fields[0].identity.low,
                    name: record._fields[0].properties.name
                });
            });
            res.render('index', { persons: personArr });
        })
        .catch(function(error) {
            console.log(error);
            res.status(500).send('Error en la consulta');
        });
});

app.use('/person/add', addRouter); // Usa el router para manejar /person/add

app.post('/person/add', function(req, res) {
    var name = req.body.name;
    
    session
        .run("CREATE (n:Person {name: $nameParam}) RETURN n", { nameParam: name })
        .then(function(result) {
            console.log("Persona agregada:", result.records[0].get(0).properties.name);
            res.redirect('/');
        })
        .catch(function(error) {
            console.log(error);
            res.status(500).send('Error al agregar persona');
        });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

module.exports = app;