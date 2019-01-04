module.exports = function (app) {

    let Controller = require('./baseController'),
        controller = new Controller(),
        http = require('http'),
        HttpsProxyAgent = require('https-proxy-agent'),
        sessionManager = require('../services/sessionManagerService');

    controller.login = function(req, resp) {
        const agent = app.get('useProxy') ? new HttpsProxyAgent(app.get('proxy')) : undefined;

        let dataString = '',
            body = {
                usuario: req.body.user,
                senha: req.body.password
            };

        let options = {
            host: app.get('authServer'),
            port: app.get('authPort'),
            path: '/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            agent: agent
        };

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

                    if(httpResp.statusCode < 200 || httpResp.statusCode >= 300){

                        let error = {
                                message: data.erros[0]
                            };

                        resp.status(httpResp.statusCode).send(error);
                    }else{
                        resp.json(sessionManager.addSession(data));
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

        httpReq.write(JSON.stringify(body));

        httpReq.end();
    };

    return controller;
};