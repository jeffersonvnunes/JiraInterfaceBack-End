module.exports = function (app) {

    let Controller = require('./baseController'),
        controller = new Controller();

    controller.getListIssues = function(req, res){
        let http = require('https');

        function processRequest(jql) {

            jql = jql !== undefined && jql !== '' ? '?jql=' + jql : '';

            let options = {
                host: 'servimex.atlassian.net',
                path: '/rest/api/2/search?jql=project=SERV%20AND%20issuetype%20not%20in%20(Epic%2C%20Sub-task)%20AND%20Sprint%20is%20EMPTY%20ORDER%20BY%20key%20ASC',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic '+ app.get('tokenJira')
                }
            };

            let dataString = '';

            let req = http.request(options, function (resp) {
                resp.setEncoding('utf8');
                resp.on('data', function (chunk) {
                    if (chunk !== null && chunk !== '') {
                        dataString += chunk;
                    }
                });

                resp.on('end', function () {
                    let issues = [],
                        data = JSON.parse(dataString);
                    try {

                        for( let i = 0; i < data.issues.length; i++){
                            issues.push({});
                            issues[i].key = data.issues[i].key;
                            issues[i].summary = data.issues[i].fields.summary;
                            issues[i].issuetype = data.issues[i].fields.issuetype.name;
                            issues[i].status = data.issues[i].fields.status.name;
                        }

                        res.json(issues);
                    } catch (erro) {
                        console.log("Got error: " + erro.message);
                        res.status(500).send(erro.message);
                    }
                });
            });

            req.on("error", function (e) {
                console.log("Got error: " + e.message);
                res.status(500).send(e.message);
            });

            //req.write(JSON.stringify(reqBody));
            req.end();
        }

        processRequest(req.query.jql);

    };

    return controller;
};