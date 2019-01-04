module.exports = function (app) {

    let controller = app.controllers.sprintController,
        baseRoute = app.routes.baseRoute,
        sessionManager = require('../services/sessionManagerService');

    app.route('/board/:boardId/sprint')
        .get(sessionManager.isAuthenticated, controller.getListSprints);

    app.route('/sprint/:id/issue')
        .get(sessionManager.isAuthenticated, controller.getListIssues)
        .post(sessionManager.isAuthenticated, controller.addIssue);

    //baseRoute.config('issues', controller);
};