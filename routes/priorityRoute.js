module.exports = function (app) {

    let controller = app.controllers.priorityController,
        baseRoute = app.routes.baseRoute;

    app.route('/priority')
        .get(controller.getListPriority);

    //baseRoute.config('issues', controller);
};
