module.exports = function (app) {

    let controller = app.controllers.authenticationController,
        baseRoute = app.routes.baseRoute;

    app.route('/login')
        .post(controller.login);

    //baseRoute.config('issues', controller);
};