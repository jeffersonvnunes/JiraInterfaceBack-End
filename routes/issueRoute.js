module.exports = function (app) {

    let controller = app.controllers.issueController,
        baseRoute = app.routes.baseRoute;

    app.route('/issues')
        .get(controller.getListIssues);

    app.route('/issues/:key')
        .get(controller.getIssue);

    app.route('/issues/:key/attachment')
        .post(controller.getFile);

    //baseRoute.config('issues', controller);
};
