const express = require('express'),
      load = require('express-load'),
      bodyParser = require('body-parser'),
      path = require('path'),
      http = require('http');

module.exports = function() {
    let app = express(),
        fs = require('fs'),
        config = null;

    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, token');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        next();
    });

    fs.readFile('./config/server_config.json','', function(err, data) {
        config = JSON.parse(data);

        app.set('port', config ? config.port : 3000);

        app.set('tokenJira', config ? config.tokenJira : '');
        app.set('baseURLJira', config ? config.baseURLJira : '');

        app.set('useProxy', config ? config.useProxy : '');
        app.set('proxyHost', config ? config.proxyHost : '');

        app.set('authPort', config ? config.authPort : '');
        app.set('authServer', config ? config.authServer : '');

        app.set('MONGO_DATABASE', config ? config.mongoDB.database : '');
        app.set('MONGO_HOST', config ? config.mongoDB.host : '');

        require('./database.js')('mongodb://'+app.get('MONGO_HOST')+'/'+app.get('MONGO_DATABASE'));

        http.createServer(app).listen(app.get('port'), function(){
            console.log('Express Server escutando na porta ' + app.get('port'));
        });
    });

    app.use(express.static('./public'));

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(require('method-override')());

    load('models').into(app);
    load('controllers/baseController.js').then('controllers').into(app);
    load('routes/baseRoute.js').then('routes').into(app);

    app.get('*', function (request, response){
        response.sendFile(path.resolve('.', 'public', 'index.html'))
    });

    return app;
};