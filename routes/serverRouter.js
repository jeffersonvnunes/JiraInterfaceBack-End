module.exports = function (app) {

    let controller = app.controllers.serverController,
        baseRoute = app.routes.baseRoute,
        sessionManager = require('../services/sessionManagerService');

    app.route('/statusServer')
        .get(sessionManager.isAuthenticated, controller.getStatusServer);

    //baseRoute.config('issues', controller);
};
