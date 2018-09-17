module.exports = function (app) {

    let controller = app.controllers.issueController,
        baseRoute = app.routes.baseRoute;

    app.route('/issues')
        .get(controller.getListIssues);

    app.route('/issues/:key')
        .get(controller.getIssue)
        .put(controller.putIssue);

    app.route('/issues/:key/attachment')
        .post(controller.getFile);

    //baseRoute.config('issues', controller);
};
