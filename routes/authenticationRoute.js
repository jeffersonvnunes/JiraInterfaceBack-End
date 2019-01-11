module.exports = function (app) {

    let controller = app.controllers.authenticationController,
        baseRoute = app.routes.baseRoute;

    app.route('/login')
        .post(controller.login);

    app.route('/logout')
        .post(controller.logout);

    //baseRoute.config('issues', controller);
};