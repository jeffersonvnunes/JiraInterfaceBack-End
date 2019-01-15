module.exports = function (app) {

    let controller = app.controllers.queryController,
        baseRoute = app.routes.baseRoute;

    app.route('/query')
        .post(controller.getQueryResult);

    //baseRoute.config('issues', controller);
};
