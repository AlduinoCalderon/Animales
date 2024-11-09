var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('add'); // Renderiza la vista del formulario para añadir persona
});

module.exports = router;