module.exports = function (app) {

    let controller = app.controllers.issueController,
        baseRoute = app.routes.baseRoute;

    app.route('/issues')
        .get(controller.getListIssues);

    //baseRoute.config('issues', controller);
};
