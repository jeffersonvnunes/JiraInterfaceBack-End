module.exports = function (app) {

    const Controller = require('./baseController'),
        http = require('https'),
        util = require('../lib/appUtils')(),
        HttpsProxyAgent = require('https-proxy-agent'),
        fs = require('fs');

    let controller = new Controller();

    controller.getListIssues = function(req, resp){
        let totalItems = 0;

        let items = [];

        function processRequest(jql, startAt = 0) {
            if(startAt === 0){
                jql = jql !== undefined && jql !== '' ? jql + ' and '  : '';
            }

            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxyHost')) : undefined;

            let options = {
                host: app.get('baseURLJira'),
                path: `/rest/api/3/search?jql=${encodeURI(jql)}project=SERV%20AND%20issuetype%20not%20in%20(Epic%2C%20Sub-task)%20ORDER%20BY%20key%20ASC&startAt=${startAt}`,
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

                            items = items.concat(util.parseIssues(data));

                            totalItems += data.maxResults;

                            if(totalItems < data.total){
                                processRequest(jql, totalItems);
                            }else{
                                resp.json(items);
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
            if(false){
                fs.readFile('issues.json', function(err, data) {
                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.write(data);
                    resp.end();
                });
            }else{
                processRequest(req.query.jql);
            }
        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }

    };

    controller.getIssue = function(req, resp){
        function processRequest(key) {
            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxy')) : undefined;

            let options = {
                host: app.get('baseURLJira'),
                path: `/rest/api/3/issue/${key}?expand=renderedFields`,
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

    controller.getIssueEditMeta = function(req, resp){
        function processRequest(key) {
            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxy')) : undefined;

            let options = {
                host: app.get('baseURLJira'),
                path: `/rest/api/3/issue/${key}/editmeta`,
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
                            issueMeta = {},
                            allowedValues,
                            meta;

                        if(data.errorMessages){
                            resp.status(httpResp.statusCode).send(data);
                        }else{
                            for (let prop in data.fields) {
                                if( data.fields.hasOwnProperty(prop) && data.fields[prop].allowedValues ) {
                                    allowedValues = data.fields[prop].allowedValues;

                                    issueMeta[prop] = {
                                        allowedValues : []
                                    };

                                    for(let i = 0; i < allowedValues.length; i++){
                                        meta = allowedValues[i];

                                        issueMeta[prop].allowedValues.push({
                                            id: meta.id,
                                            name: meta.name,
                                            value: meta.value
                                        });
                                    }
                                }
                            }

                            resp.json(issueMeta);
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
                host: app.get('baseURLJira'),
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

    controller.putIssue = function(req, resp){
        function processRequest(key, issue) {
            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxy')) : undefined;

            let reqBody = {
                fields: {}
            };

            if(issue.priority){
                reqBody.fields.priority = {
                    id: issue.priority.id
                };
            }

            if(issue.sprint){
                reqBody.fields.customfield_10010 = issue.sprint.id ? issue.sprint.id : null;
            }

            if(issue.requireHomologation){
                reqBody.fields.customfield_10037 = issue.requireHomologation.id ? { id: issue.requireHomologation.id } : null;
            }

            if(issue.productOwner){
                reqBody.fields.customfield_10036 = issue.productOwner.id ? { id: issue.productOwner.id } : null;
            }

            if(issue.departments){
                reqBody.fields.customfield_10040 = [];

                for(let i = 0; i < issue.departments.length; i++){
                    reqBody.fields.customfield_10040.push({
                        id: issue.departments[i].id
                    });
                }
            }

            if(issue.lastUserUpdate){
                reqBody.fields.customfield_10044 = `${issue.lastUserUpdate} em ${(new Date()).toLocaleString()}`;
            }

            if(issue.sac){
                reqBody.fields.customfield_10029 = issue.sac;
            }

            let options = {
                host: app.get('baseURLJira'),
                path: `/rest/api/3/issue/${key}`,
                method: 'PUT',
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
                    try{
                        if(httpResp.statusCode < 200 || httpResp.statusCode >= 300 ){
                            console.log("Error", dataString);
                        }
                        resp.status(httpResp.statusCode).send(dataString);
                    }catch(e) {
                        console.log("Got error: " + e.message);
                        resp.status(500).send(e.message);
                    }
                });
            });

            httpReq.on("error", function (e) {
                console.log("Got error request: " + e.message);
                resp.status(500).send(e.message);
            });

            httpReq.write(JSON.stringify(reqBody));

            httpReq.end();
        }

        try{
            const issue = req.body;

            processRequest(req.params.key, issue);
        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    controller.setEstimatedTime = function(req, resp){
        let totalItems = 0,
            items = [];

        function processRequest(jql, startAt = 0) {
            if(startAt === 0) {
                jql = jql !== undefined && jql !== '' ? jql + ' and ' : '';
            }

            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxyHost')) : undefined;

            let options = {
                host: app.get('baseURLJira'),
                path: `/rest/api/3/search?jql=${encodeURI(jql)}originalEstimate%20in%20(0%2C%20EMPTY)%20ORDER%20BY%20key%20ASC&startAt=${startAt}`,
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

                            items = items.concat(data.issues);

                            totalItems += data.maxResults;

                            if(totalItems < data.total){
                                processRequest(jql, totalItems);
                            }else{
                                let issue, httpReqIssue, body,
                                    optionsPut = {
                                        host: app.get('baseURLJira'),
                                        method: 'PUT',
                                        headers: {
                                            'Authorization':'Basic '+ app.get('tokenJira'),
                                            'Content-Type': 'application/json'
                                        },
                                        agent: agent
                                    };

                                for(let i = 0; i < items.length; i++){
                                    issue = items[i];

                                    optionsPut.path = `/rest/api/3/issue/${issue.key}`;

                                    dataString = '';

                                    httpReqIssue = http.request(optionsPut, function (httpResp) {
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

                                    body = JSON.stringify({
                                        fields:{
                                            timetracking: {
                                                originalEstimate: issue.fields.customfield_10014+'h'
                                            }
                                        }
                                    });

                                    httpReqIssue.write(body);

                                    httpReqIssue.on("error", function (e) {
                                        console.log("Got error request: " + e.message);
                                    });

                                    httpReqIssue.end();
                                }

                                resp.status(202).send();
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
            processRequest(req.body.jql);
        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    return controller;
};