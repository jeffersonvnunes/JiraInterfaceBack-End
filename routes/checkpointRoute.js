module.exports = function (app) {

    let controller = app.controllers.checkpointController,
        baseRoute = app.routes.baseRoute,
        sessionManager = require('../services/sessionManagerService');

    //baseRoute.config('checkpoints', controller);

    app.route('/checkpoints/:sprintID')
        .get(sessionManager.isAuthenticated, controller.getCheckpoints)
        .post(sessionManager.isAuthenticated, controller.newCheckpoint);

    app.route('/checkpointstotals')
        .get(sessionManager.isAuthenticated, controller.getCheckpointsTotals);

};
