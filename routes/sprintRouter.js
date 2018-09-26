module.exports = function (app) {

    let controller = app.controllers.sprintController,
        baseRoute = app.routes.baseRoute;

    app.route('/board/:boardId/sprint')
        .get(controller.getListSprints);

    app.route('/sprint/:id/issue')
        .get(controller.getListIssues);

    //baseRoute.config('issues', controller);
};