module.exports = function (app) {

    const Controller = require('./baseController'),
          sessionManager = require('../services/sessionManagerService');
    let controller = new Controller();

    controller.getStatusServer = function(req, res){

        function processRequest() {

            let status = {
                sessions: []
            }, session;

            for( let i = 0; i < sessionManager.sessions.length; i++){
                session = sessionManager.sessions[i];
                status.sessions.push({
                    userName: session.userName,
                    userLogin: session.userLogin,
                    loginDate: session.loginDate,
                    expiryDate: session.expiryDate,
                });
            }

            res.json(status);

        }
        try{
            processRequest();
        } catch (erro) {
            console.log("Got error: " +erro.message);
            res.status(500).send(erro.message);
        }
    };
    return controller;
};