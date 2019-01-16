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

        function processRequest(jql, params ,startAt = 0) {

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

                function departmentTotals(dataResp){
                    let issue,
                        items = [],
                        departments = {};

                    for(let i = 0; i < dataResp.query.length; i++){
                        issue = dataResp.query[i];
                        issue.departments.forEach(department => {
                            if(department.id !== "10070"){
                                if(!departments[department.id]){
                                    departments[department.id] = {
                                        id: department.id,
                                        name: department.value,
                                        bugs: 0,
                                        stories: 0,
                                        storiesPoints: 0,
                                        totalIssues: 0,
                                        storiesPointsAverage: 0,
                                    };
                                }

                                if(issue.issuetype.toLowerCase() === 'bug'){
                                    departments[department.id].bugs++;
                                }else{
                                    departments[department.id].stories++;
                                }

                                departments[department.id].storiesPoints += issue.storyPoints;
                                departments[department.id].totalIssues++;
                                departments[department.id].storiesPointsAverage +=  Math.round(issue.storyPoints/issue.departments.length);
                            }
                        });
                    }

                    for (let item in departments){
                        items.push(departments[item]);
                    }

                    dataResp.query = items;
                }

                function typeTotals(dataResp){
                    let issue,
                        items = [],
                        types = {};

                    for(let i = 0; i < dataResp.query.length; i++){
                        issue = dataResp.query[i];

                        if(!types[issue.issuetype]){
                            types[issue.issuetype] = {
                                name: issue.issuetype,
                                total: 0,
                                typePoints: 0,
                            };
                        }

                        types[issue.issuetype].total++;
                        types[issue.issuetype].typePoints += issue.storyPoints;
                    }

                    for (let item in types){
                        items.push(types[item]);
                    }

                    dataResp.query = items;
                }

                httpResp.on('end', function () {
                    try {

                        if(httpResp.statusCode >= 200 && httpResp.statusCode <= 299){
                            let data = JSON.parse(dataString);

                            dataResp.query = dataResp.query.concat(util.parseIssues(data));

                            totalItems += data.maxResults;

                            if(totalItems < data.total){
                                processRequest(jql, params, totalItems);
                            }else{

                                if(params.department){
                                    departmentTotals(dataResp);
                                }else if(params.type){
                                    typeTotals(dataResp);
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
            processRequest(req.body.jql, req.query);

        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    return controller;
};