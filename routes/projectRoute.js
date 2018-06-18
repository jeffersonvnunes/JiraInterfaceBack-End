module.exports = function (app) {

    let controller = app.controllers.projectController,
        baseRoute = app.routes.baseRoute;

    app.route('/project/:projectId/components')
        .get(controller.getListComponents);

    //baseRoute.config('issues', controller);
};
