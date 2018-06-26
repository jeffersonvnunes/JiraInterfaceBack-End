module.exports = function (app) {

    let Controller = require('./baseController'),
        controller = new Controller();

    controller.getListIssues = function(req, resp){
        let http = require('https'),
            util = require('../lib/appUtils')();

        let totalItems = 0;

        let items = [];

        function processRequest(jql, startAt = 0) {

            jql = jql !== undefined && jql !== '' ? '?jql=' + jql : '';

            let options = {
                host: 'servimex.atlassian.net',
                path: `/rest/api/2/search?jql=project=SERV%20AND%20issuetype%20not%20in%20(Epic%2C%20Sub-task)%20AND%20Sprint%20is%20EMPTY%20ORDER%20BY%20key%20ASC&startAt=${startAt}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic '+ app.get('tokenJira')
                }
            };

            let dataString = '';

            let req = http.request(options, function (httpResp) {
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
                        console.log("Got error: " + erro.message);
                        resp.status(500).send(erro.message);
                    }
                });
            });

            req.on("error", function (e) {
                console.log("Got error: " + e.message);
                resp.status(500).send(e.message);
            });

            //req.write(JSON.stringify(reqBody));
            req.end();
        }

        processRequest(req.query.jql);

    };

    return controller;
};