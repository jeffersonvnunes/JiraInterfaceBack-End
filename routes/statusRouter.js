module.exports = function (app) {

    let controller = app.controllers.statusController,
        baseRoute = app.routes.baseRoute;

    app.route('/status')
        .get(controller.getListStatus);

    //baseRoute.config('issues', controller);
};
