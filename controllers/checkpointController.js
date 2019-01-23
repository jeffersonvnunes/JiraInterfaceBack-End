module.exports = function (app) {

    const Controller = require('./baseController'),
          http = require('https'),
          util = require('../lib/appUtils')(),
          HttpsProxyAgent = require('https-proxy-agent');

    let controller = new Controller();

    controller.Model = app.models.checkpointModel;

    controller.newCheckpoint = function(req, resp){
        let totalItems = 0;

        let issues = [];

        function processRequest(sprintID, startAt = 0) {

            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxyHost')) : undefined;

            let options = {
                host: app.get('baseURLJira'),
                path: `/rest/api/3/search?jql=project=SERV%20AND%20Sprint%20%3D%20${sprintID}&startAt=${startAt}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic '+ app.get('tokenJira')
                },
                agent: agent
            };

            let dataString = '';

            let httpReq = http.request(options, function (httpResp) {
                httpResp.setEncoding('utf8');
                httpResp.on('data', function (chunk) {
                    if (chunk !== null && chunk !== '') {
                        dataString += chunk;
                    }
                });

                httpResp.on('end', function () {
                    try {

                        if(httpResp.statusCode >= 200 && httpResp.statusCode <= 299){
                            let data = JSON.parse(dataString);

                            issues = issues.concat(util.parseIssues(data));

                            totalItems += data.maxResults;

                            if(totalItems < data.total){
                                processRequest(sprintID, totalItems);
                            }else{
                                let checkpoint = {
                                    sprintID: sprintID,
                                    checkpointType: 'OPENING',
                                    issues: issues,
                                };

                                controller.Model.create(checkpoint).then(function(model){
                                    resp.status(201).json(model);
                                }, function (error) {
                                    console.log(error);
                                    resp.status(500).json(error);
                                });
                            }
                        }else{
                            console.log('Error: ', dataString);
                            let msg = {
                                error: 'Não foi possível realizar a consulta'
                            };
                            resp.status(httpResp.statusCode).json(msg);
                        }
                    } catch (erro) {
                        console.log("Got error end: " + erro.message);
                        resp.status(500).send(erro.message);
                    }
                });
            });

            httpReq.on("error", function (e) {
                console.log("Got error request: " + e.message);
                resp.status(500).send(e.message);
            });

            httpReq.end();
        }

        try{
            processRequest(req.params.sprintID);

        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    return controller;
};