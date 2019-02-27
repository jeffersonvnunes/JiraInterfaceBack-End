module.exports = function (app) {

    const Controller = require('./baseController');
    let controller = new Controller();

    controller.getListComponents = function(req, res){
        const http = require('https'),
              HttpsProxyAgent = require('https-proxy-agent');

        function processRequest(projectId) {

            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxyHost')) : undefined;

            let options = {
                host: app.get('baseURLJira'),
                path: '/rest/api/3/project/'+projectId+'/components',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic '+ app.get('tokenJira')
                },
                agent: agent
            };

            let dataString = '';

            let httpReq = http.request(options, function (resp) {
                resp.setEncoding('utf8');
                resp.on('data', function (chunk) {
                    if (chunk !== null && chunk !== '') {
                        dataString += chunk;
                    }
                });

                resp.on('end', function () {
                    try {
                        let components = [],
                            data = JSON.parse(dataString);

                        for( let i = 0; i < data.length; i++){
                            components.push({
                                id: data[i].id,
                                name: data[i].name,
                                projectId: data[i].projectId
                            });
                        }

                        res.json(components);
                    } catch (erro) {
                        console.log("Got error end: " + erro.message);
                        res.status(500).send(erro.message);
                    }
                });
            });

            httpReq.on("error", function (e) {
                console.log("Got error request: " + e.message);
                res.status(500).send(e.message);
            });

            httpReq.end();
        }
        try{
            processRequest(req.params.projectId);
        } catch (erro) {
            console.log("Got error: " + erro.message);
            res.status(500).send(erro.message);
        }
    };

    controller.getListStatus = function(req, res){
        const http = require('https'),
            HttpsProxyAgent = require('https-proxy-agent');

        function processRequest(projectId) {

            const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxyHost')) : undefined;

            let options = {
                host: app.get('baseURLJira'),
                path: '/rest/api/3/project/'+projectId+'/statuses',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Basic '+ app.get('tokenJira')
                },
                agent: agent
            };

            let dataString = '';

            let httpReq = http.request(options, function (resp) {
                resp.setEncoding('utf8');
                resp.on('data', function (chunk) {
                    if (chunk !== null && chunk !== '') {
                        dataString += chunk;
                    }
                });

                resp.on('end', function () {
                    try {
                        let statusList = [],
                            data = JSON.parse(dataString);

                        data = data[0] ? data[0].statuses : [];

                        for( let i = 0; i < data.length; i++){
                            statusList.push({
                                id: data[i].id,
                                name: data[i].name,
                                colorName: data[i].statusCategory ? data[i].statusCategory.colorName : 'white',
                            });
                        }

                        res.json(statusList);
                    } catch (erro) {
                        console.log("Got error end: " + erro.message);
                        res.status(500).send(erro.message);
                    }
                });
            });

            httpReq.on("error", function (e) {
                console.log("Got error request: " + e.message);
                res.status(500).send(e.message);
            });

            httpReq.end();
        }
        try{
            processRequest(req.params.projectId);
        } catch (erro) {
            console.log("Got error: " +erro.message);
            res.status(500).send(erro.message);
        }
    };

    return controller;
};