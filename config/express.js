const express = require('express'),
      load = require('express-load'),
      bodyParser = require('body-parser'),
      path = require('path');

module.exports = function() {
    let app = express();

    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });

    app.set('tokenJira', JIRA_KEY);
    app.set('baseURLJira', 'URL');

    app.set('port', 3000);

    app.set('useProxy', false);
    app.set('proxy', 'host');

    app.set('authPort', 8081);
    app.set('authServer', 'localhost');

    app.use(express.static('./public'));

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(require('method-override')());

    load('models').into(app);
    load('controllers/baseController.js').then('controllers').into(app);
    load('routes/baseRoute.js').then('routes').into(app);

    app.get('*', function (request, response){
        response.sendFile(path.resolve('.', 'public', 'index.html'))
    })

    return app;
};