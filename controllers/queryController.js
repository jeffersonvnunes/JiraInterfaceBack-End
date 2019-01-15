module.exports = function (app) {

    const Controller = require('./baseController'),
        http = require('https'),
        util = require('../lib/appUtils')(),
        HttpsProxyAgent = require('https-proxy-agent');

    let controller = new Controller();

    controller.getQueryResult = function(req, resp){
        let totalItems = 0;

        let dataResp = {
            query: [],
            fields: []
        };

        function processRequest(jql, total ,startAt = 0) {

            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxyHost')) : undefined;

            let options = {
                host: app.get('baseURLJira'),
                path: `/rest/api/3/search?jql=${encodeURI(jql)}&startAt=${startAt}`,
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

                            dataResp.query = dataResp.query.concat(util.parseIssues(data));

                            totalItems += data.maxResults;

                            if(totalItems < data.total){
                                processRequest(jql, total, totalItems);
                            }else{

                                if(total){
                                    let issue,
                                        items = [],
                                        departmentsPoints = {};

                                    for(let i = 0; i < dataResp.query.length; i++){
                                        issue = dataResp.query[i];

                                        issue.departments.forEach(department => {
                                            if(!departmentsPoints[department.id]){
                                                departmentsPoints[department.id] = {
                                                    id: department.id,
                                                    name: department.value,
                                                    bugs: 0,
                                                    stories: 0,
                                                    totalIssues: 0,
                                                };
                                            }

                                            if(issue.issuetype.toLowerCase() === 'bug'){
                                                departmentsPoints[department.id].bugs++;
                                            }else{
                                                departmentsPoints[department.id].stories++;
                                            }

                                            departmentsPoints[department.id].totalIssues++;
                                        });
                                    }

                                    for (let id in departmentsPoints){
                                        items.push(departmentsPoints[id]);
                                    }

                                    dataResp.query = items;
                                }

                                let item = dataResp.query[0];
                                if(item){
                                    for (let field in item){
                                        dataResp.fields.push(field);
                                    }
                                }

                                resp.json(dataResp);
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
            processRequest(req.body.jql, req.query.total);

        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }

    };

    return controller;
};