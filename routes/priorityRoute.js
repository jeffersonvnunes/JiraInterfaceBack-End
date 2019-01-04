module.exports = function (app) {

    let controller = app.controllers.priorityController,
        baseRoute = app.routes.baseRoute,
        sessionManager = require('../services/sessionManagerService');

    app.route('/priority')
        .get(sessionManager.isAuthenticated, controller.getListPriority);

    //baseRoute.config('issues', controller);
};
