module.exports = function (app) {
    let Controller = require('./baseController'),
        https = require('https'),
        util = require('../lib/appUtils')(),
        HttpsProxyAgent = require('https-proxy-agent'),
        controller = new Controller();


    controller.getListIssues = function(req, resp){
        let totalItems = 0,
            items = [];

        function processRequest(id, jql, startAt = 0) {

            jql = jql !== undefined && jql !== '' ? jql + ' and '  : '';

            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxyHost')) : undefined;

            let options = {
                host: app.get('baseURLJira'),
                path: `/rest/agile/1.0/sprint/${id}/issue?jql=${encodeURI(jql)}issuetype%20not%20in%20(Epic%2C%20Sub-task)%20ORDER%20BY%20key%20ASC&startAt=${startAt}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic '+ app.get('tokenJira')
                },
                agent: agent
            };

            let dataString = '';

            let httpReq = https.request(options, function (httpResp) {
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

                            items = items.concat(util.parseIssues(data));

                            totalItems += data.maxResults;

                            if(totalItems < data.total){
                                processRequest(id, jql, totalItems);
                            }else{
                                resp.json(items);
                            }
                        }else{
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
            processRequest(req.params.id, req.query.jql);
        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    controller.setEstimatedTime = function(req, resp){
        let totalItems = 0,
            items = [];

        function processRequest(id, jql, startAt = 0) {

            jql = jql !== undefined && jql !== '' ? jql + ' and '  : '';

            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxyHost')) : undefined;

            let options = {
                host: app.get('baseURLJira'),
                path: `/rest/agile/1.0/sprint/${id}/issue?jql=${encodeURI(jql)}originalEstimate%20in%20(0%2C%20EMPTY)%20ORDER%20BY%20key%20ASC&startAt=${startAt}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic '+ app.get('tokenJira')
                },
                agent: agent
            };

            let dataString = '';

            let httpReq = https.request(options, function (httpResp) {
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

                            items = items.concat(data.issues);

                            totalItems += data.maxResults;

                            if(totalItems < data.total){
                                processRequest(id, jql, totalItems);
                            }else{
                                let issue, httpReqIssue, body;

                                for(let i = 0; i< items.length; i++){
                                    issue = items[i];

                                    options.path = `/rest/api/3/issue/${issue.key}`;
                                    options.method = 'PUT';

                                    httpReqIssue = https.request(options, function (httpResp) {
                                        httpResp.setEncoding('utf8');
                                        httpResp.on('data', function (chunk) {
                                            if (chunk !== null && chunk !== '') {
                                                dataString += chunk;
                                            }
                                        });

                                        httpResp.on('end', function (){
                                            if(httpResp.statusCode < 200 && httpResp.statusCode > 299){
                                                console.log("Got error request: " + dataString);
                                            }
                                        });
                                    });

                                    body = {
                                        fields:{
                                            timetracking: {
                                                originalEstimate: issue.fields.customfield_10014+'h'
                                            }
                                        }
                                    };

                                    httpReqIssue.write(JSON.stringify(body));

                                    httpReqIssue.on("error", function (e) {
                                        console.log("Got error request: " + e.message);
                                    });

                                    httpReqIssue.end();
                                }

                                resp.status(204);
                            }
                        }else{
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
            processRequest(req.params.id, req.query.jql);
        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    controller.getListSprints = function(req, resp){
        function processRequest(boardId) {
            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxy')) : undefined;

            let options = {
                host: app.get('baseURLJira'),
                path: `/rest/agile/1.0/board/${boardId}/sprint`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic '+ app.get('tokenJira')
                },
                agent: agent
            };

            let dataString = '';

            let httpReq = https.request(options, function (httpResp) {
                httpResp.setEncoding('utf8');
                httpResp.on('data', function (chunk) {
                    if (chunk !== null && chunk !== '') {
                        dataString += chunk;
                    }
                });

                httpResp.on('end', function () {
                    try {
                        let data = JSON.parse(dataString),
                            sprints = [],
                            sprint = null;

                        if(data.errorMessages){
                            resp.status(httpResp.statusCode).send(data);
                        }else{
                            for(let i = 0; i < data.values.length; i++){
                                sprint = data.values[i];
                                sprints.push({
                                   id: sprint.id,
                                   state: sprint.state,
                                   name: sprint.name,
                                   canEdit: sprint.state.toUpperCase() === 'FUTURE',
                                });
                            }
                            resp.json(sprints);
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
            processRequest(req.params.boardId);
        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    controller.addIssue = function(req, resp){
        function processRequest(id, body) {
            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxy')) : undefined;

            if(!body.issues && body.issues.length === 0){
                resp.status(400).send("issues attribute not informed or is empty.");
            }

            let options = {
                host: app.get('baseURLJira'),
                path: `/rest/agile/1.0/sprint/${id}/issue`,
                method: 'POST',
                headers: {
                    'Authorization':'Basic '+ app.get('tokenJira'),
                    'Content-Type': 'application/json'
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
                    resp.status(httpResp.statusCode).send(dataString);
                });
            });

            httpReq.on("error", function (e) {
                console.log("Got error request: " + e.message);
                resp.status(500).send(e.message);
            });

            httpReq.write(JSON.stringify(body));

            httpReq.end();
        }

        try{
            processRequest(req.params.id, req.body);
        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    return controller;
};