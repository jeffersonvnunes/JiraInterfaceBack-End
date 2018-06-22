let express = require('express'),
    load = require('express-load'),
    bodyParser = require('body-parser');

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

    app.set('port', 3000);

    app.use(express.static('./public'));


    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(require('method-override')());

    load('models').into(app);
    load('controllers/baseController.js').then('controllers').into(app);
    load('routes/baseRoute.js').then('routes').into(app);

    return app;
};