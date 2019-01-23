module.exports = function (app) {

    let controller = app.controllers.checkpointController,
        baseRoute = app.routes.baseRoute,
        sessionManager = require('../services/sessionManagerService');

    baseRoute.config('checkpoints', controller);

    app.route('/checkpoints/:sprintID')
        .post(sessionManager.isAuthenticated, controller.newCheckpoint);
};
