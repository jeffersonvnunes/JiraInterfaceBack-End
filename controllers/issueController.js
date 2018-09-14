module.exports = function (app) {

    let Controller = require('./baseController'),
        http = require('https'),
        util = require('../lib/appUtils')(),
        HttpsProxyAgent = require('https-proxy-agent'),
        controller = new Controller();

    controller.getListIssues = function(req, resp){
        let totalItems = 0;

        let items = [];

        function processRequest(jql, startAt = 0) {

            jql = jql !== undefined && jql !== '' ? jql + ' and '  : '';

            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxy')) : undefined;

            let options = {
                host: 'servimex.atlassian.net',
                path: `/rest/api/2/search?jql=${encodeURI(jql)}project=SERV%20AND%20issuetype%20not%20in%20(Epic%2C%20Sub-task)%20AND%20Sprint%20is%20EMPTY%20ORDER%20BY%20key%20ASC&startAt=${startAt}`,
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

                        let data = JSON.parse(dataString);

                        items = items.concat(util.parseIssues(data));

                        totalItems += data.maxResults;

                        if(totalItems < data.total){
                            processRequest(jql, totalItems);
                        }else{
                            resp.json(items);
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

            //req.write(JSON.stringify(reqBody));
            httpReq.end();
        }

        try{
            processRequest(req.query.jql);
        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }

    };

    controller.getIssue = function(req, resp){
        function processRequest(key) {
            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxy')) : undefined;

            let options = {
                host: 'servimex.atlassian.net',
                path: `/rest/api/2/issue/${key}?expand=renderedFields`,
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
                        let data = JSON.parse(dataString),
                            issue = {
                                issues: []
                            };

                        if(data.errorMessages){
                            resp.status(httpResp.statusCode).send(data);
                        }else{
                            issue.issues.push(data);
                            issue = util.parseIssues(issue)[0];
                            resp.json(issue);
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
            processRequest(req.params.key);
        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    controller.getFile = function(req, resp){
        function processRequest(body) {
            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxy')) : undefined;

            let options = {
                host: 'servimex.atlassian.net',
                path: body.file,
                method: 'GET',
                headers: {
                    'Authorization':'Basic '+ app.get('tokenJira'),
                    'X-Atlassian-Token': 'no-check'
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
                    if(httpResp.statusCode = 302){
                        let file = {
                          uri: httpResp.headers.location
                        };
                        resp.json(file);
                    }else{
                        resp.status(httpResp.statusCode).send(dataString);
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
            processRequest(req.body);
        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    return controller;
};