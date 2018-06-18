module.exports = function (app) {

    var controller = app.controllers.issueController,
        baseRoute = app.routes.baseRoute;

    app.route('/issues')
        .get(controller.getListIssues);

    //baseRoute.config('issues', controller);
};
