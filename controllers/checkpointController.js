module.exports = function (app) {

    const Controller = require('./baseController'),
          http = require('https'),
          util = require('../lib/appUtils')(),
          HttpsProxyAgent = require('https-proxy-agent');
          //appRoot = require('app-root-path'),
          //winston = require(appRoot+'/config/winston');

    let controller = new Controller();

    controller.Model = app.models.checkpointModel;

    controller.newCheckpoint = function(req, resp){
        let totalItems = 0,
            closing = false,
            action = 'TRACKING';

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
                                    checkpointType: action,
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
            closing = req.query.closing;
            controller.Model.find({sprintID: req.params.sprintID, $or: [{checkpointType: 'OPENING'},{checkpointType: 'CLOSING'}]}, 'checkpointType').exec()
                .then(
                    function(qry) {

                        if(closing && closing.toUpperCase() === 'TRUE' && qry.length === 0){
                            let msg = {
                                error: 'Deve existir um checkpoint de abertura para poder realizar o fechamento'
                            };

                            resp.status(400).json(msg);
                            return;
                        }else if(qry.length > 1){
                            let msg = {
                                error: 'Sprint já possui checkpoint de fechamento'
                            };

                            resp.status(400).json(msg);
                            return;
                        }

                        if(qry.length === 0){
                            action = 'OPENING';
                        } else if(closing && closing.toUpperCase() === 'TRUE'){
                            action = 'CLOSING';
                        }

                        processRequest(req.params.sprintID);

                    },
                    function(error) {
                        console.log(error);
                        resp.status(500).json(error);
                    }
                );

        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    controller.getCheckpoints = function(req, resp){
        try{
            controller.Model.find({sprintID: req.params.sprintID}).sort({date: 1}).exec()
                .then(
                    function(qry) {
                        resp.status(201).json(qry);
                    },
                    function(error) {
                        console.log(error);
                        resp.status(500).json(error);
                    }
                );

        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    controller.getCheckpointsTotals = function(req, resp){
        try{
            let dtStart = req.query.dtStart,
                dtEnd = req.query.dtEnd;

            controller.Model.find({date: {$gte:  new Date(dtStart),$lte: new Date(dtEnd)}, checkpointType: 'CLOSING'}).exec()
                .then(
                    function(qry) {

                        let issuesTotals = {
                            totalIssues: 0,
                            totalPoints: 0,
                            finishedIssues: 0,
                            finishedPoints:0,
                            sprints: []
                        },
                        issue = null;

                        for(let i = 0 ; i < qry.length; i++){
                            issuesTotals.sprints.push({
                                sprintID: qry[i].sprintID,
                                totalIssues: 0,
                                totalPoints: 0,
                                finishedIssues: 0,
                                finishedPoints:0
                            });
                            for(let x = 0; x < qry[i].issues.length; x++){
                                issue = qry[i].issues[x];

                                issuesTotals.sprints[i].totalIssues++;
                                issuesTotals.sprints[i].totalPoints += issue.storyPoints;

                                issuesTotals.totalIssues++;
                                issuesTotals.totalPoints += issue.storyPoints;

                                if(issue.status === 'Em Produção' || issue.status === 'Concluído por TI'){
                                    issuesTotals.sprints[i].finishedIssues++;
                                    issuesTotals.sprints[i].finishedPoints += issue.storyPoints;

                                    issuesTotals.finishedIssues++;
                                    issuesTotals.finishedPoints += issue.storyPoints;
                                }
                            }

                            issuesTotals.sprints[i].totalPoints = Math.round(issuesTotals.sprints[i].totalPoints + 0.00001) * 100 /100;
                            issuesTotals.sprints[i].finishedPoints = Math.round(issuesTotals.sprints[i].finishedPoints + 0.00001) * 100 /100;
                        }

                        issuesTotals.totalPoints = Math.round(issuesTotals.totalPoints + 0.00001) * 100 /100;
                        issuesTotals.finishedPoints = Math.round(issuesTotals.finishedPoints + 0.00001) * 100 /100;

                        resp.status(201).json(issuesTotals);
                    },
                    function(error) {
                        console.log(error);
                        resp.status(500).json(error);
                    }
                );

        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    return controller;
};