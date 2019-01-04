module.exports = function (app) {

    let controller = app.controllers.statusController,
        baseRoute = app.routes.baseRoute,
        sessionManager = require('../services/sessionManagerService');

    app.route('/status')
        .get(sessionManager.isAuthenticated, controller.getListStatus);

    //baseRoute.config('issues', controller);
};
