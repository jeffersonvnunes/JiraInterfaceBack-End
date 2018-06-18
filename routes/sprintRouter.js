module.exports = function (app) {

    let controller = app.controllers.sprintController,
        baseRoute = app.routes.baseRoute;

    app.route('/sprint')
        .get(controller.getListIssues);

    //baseRoute.config('issues', controller);
};