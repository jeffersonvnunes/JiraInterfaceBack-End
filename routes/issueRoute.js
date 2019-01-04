module.exports = function (app) {

    let controller = app.controllers.issueController,
        baseRoute = app.routes.baseRoute,
        sessionManager = require('../services/sessionManagerService');

    app.route('/issues')
        .get(sessionManager.isAuthenticated, controller.getListIssues);

    app.route('/issues/:key')
        .get(sessionManager.isAuthenticated, controller.getIssue)
        .put(sessionManager.isAuthenticated, controller.putIssue);

    app.route('/issues/:key/attachment')
        .post(sessionManager.isAuthenticated, controller.getFile);

    app.route('/issues/:key/editmeta')
        .get(sessionManager.isAuthenticated, controller.getIssueEditMeta);

    //baseRoute.config('issues', controller);
};
