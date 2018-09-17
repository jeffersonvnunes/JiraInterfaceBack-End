module.exports = function (app) {

    const Controller = require('./baseController');
    let controller = new Controller();

    controller.getListPriority = function(req, res){
        const http = require('https'),
            HttpsProxyAgent = require('https-proxy-agent');

        function processRequest() {

            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxy')) : undefined;

            let options = {
                host: 'servimex.atlassian.net',
                path: '/rest/api/2/priority',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic '+ app.get('tokenJira')
                },
                agent: agent
            };

            let dataString = '';

            let httpReq = http.request(options, function (resp) {
                resp.setEncoding('utf8');
                resp.on('data', function (chunk) {
                    if (chunk !== null && chunk !== '') {
                        dataString += chunk;
                    }
                });

                resp.on('end', function () {
                    try {
                        let priorities = [],
                            data = JSON.parse(dataString);

                        for( let i = 0; i < data.length; i++){
                            priorities.push({
                                id: data[i].id,
                                name: data[i].name,
                            });
                        }

                        res.json(priorities);
                    } catch (erro) {
                        console.log("Got error end: " + erro.message);
                        res.status(500).send(erro.message);
                    }
                });
            });

            httpReq.on("error", function (e) {
                console.log("Got error request: " + e.message);
                res.status(500).send(e.message);
            });

            httpReq.end();
        }
        try{
            processRequest();
        } catch (erro) {
            console.log("Got error: " + e.message);
            res.status(500).send(e.message);
        }
    };

    return controller;
};