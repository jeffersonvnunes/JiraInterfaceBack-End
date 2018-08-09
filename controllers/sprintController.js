module.exports = function (app) {
    let Controller = require('./baseController'),
        controller = new Controller();


    controller.getListIssues = function(req, resp){
        const https = require('https'),
              util = require('../lib/appUtils')(),
              HttpsProxyAgent = require('https-proxy-agent');

        let totalItems = 0;

        let items = [];

        function processRequest(jql, startAt = 0) {

            jql = jql !== undefined && jql !== '' ? jql + ' and '  : '';

            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxy')) : undefined;

            let options = {
                host: 'servimex.atlassian.net',
                path: `/rest/agile/1.0/sprint/7/issue?jql=${encodeURI(jql)}issuetype%20not%20in%20(Epic%2C%20Sub-task)%20ORDER%20BY%20key%20ASC&startAt=${startAt}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic '+ app.get('tokenJira')
                },
                agent: agent
            };

            let dataString = '';

            let req = https.request(options, function (httpResp) {
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

            req.on("error", function (e) {
                console.log("Got error request: " + e.message);
                resp.status(500).send(e.message);
            });


            req.end();
        }

        try{
            processRequest(req.query.jql);
        }catch (e) {
            console.log("Got error: " + e.message);
            resp.status(500).send(e.message);
        }
    };

    return controller;
};