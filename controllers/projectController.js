module.exports = function (app) {

    const Controller = require('./baseController');
    let controller = new Controller();

    controller.getListComponents = function(req, res){
        const http = require('https');

        function processRequest(projectId) {
            let options = {
                host: 'servimex.atlassian.net',
                path: '/rest/api/2/project/'+projectId+'/components',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic '+ app.get('tokenJira')
                }
            };

            let dataString = '';

            let req = http.request(options, function (resp) {
                resp.setEncoding('utf8');
                resp.on('data', function (chunk) {
                    if (chunk !== null && chunk !== '') {
                        dataString += chunk;
                    }
                });

                resp.on('end', function () {
                    let components = [],
                        data = JSON.parse(dataString);

                    try {
                        for( let i = 0; i < data.length; i++){
                            components.push({
                                id: data[i].id,
                                name: data[i].name,
                                projectId: data[i].projectId
                            });
                        }

                        res.json(components);
                    } catch (erro) {
                        console.log("Got error: " + erro.message);
                        res.status(500).send(erro.message);
                    }
                });
            });

            req.on("error", function (e) {
                console.log("Got error: " + e.message);
                res.status(500).send(e.message);
            });

            req.end();
        }

        processRequest(req.params.projectId);
    };

    return controller;
};