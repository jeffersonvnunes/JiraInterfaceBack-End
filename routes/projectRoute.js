module.exports = function (app) {

    let controller = app.controllers.projectController,
        baseRoute = app.routes.baseRoute,
        sessionManager = require('../services/sessionManagerService');

    app.route('/project/:projectId/components')
        .get(sessionManager.isAuthenticated, controller.getListComponents);

    app.route('/project/:projectId/statuses')
        .get(sessionManager.isAuthenticated, controller.getListStatus);

    //baseRoute.config('issues', controller);
};
