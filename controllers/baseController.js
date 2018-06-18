module.exports = function () {

    var controller = {};

    controller.Model = null;

    controller.listModel = function(req, res) {

        controller.Model.find().exec()
            .then(
                function(models) {
                    res.json(models);
                },
                function(error) {
                    console.error(error);
                    res.status(500).json(error);
                }
            );
    };

    controller.getModel = function(req, res) {

        var _id = req.params.id;
        controller.Model.findById(_id).exec()
            .then(
                function(model) {
                    if (model){
                        res.json(model);
                    } else{
                        res.status(404).send();
                    }
                },
                function(error) {
                    console.log(error);
                    res.status(404).json(error);
                }
            );
    };

    controller.removeModel = function(req, res) {

        var _id = req.params.id;
        controller.Model.remove({"_id" : _id}).exec()
            .then(
                function() {
                    res.end();
                },
                function(error) {
                    return console.error(error);
                }
            );
    };

    controller.saveModel = function(req, res) {

        var _id = req.body._id;

        if(_id) {
            controller.Model.findByIdAndUpdate(_id, req.body, {new:true}).exec()
                .then(
                    function(model) {
                        res.json(model);
                    },
                    function(error) {
                        console.error(error);
                        res.status(500).json(error);
                    }
                );
        } else {
            controller.Model.create(req.body)
                .then(
                    function(model) {
                        res.status(201).json(model);
                    },
                    function(error) {
                        console.log(error);
                        res.status(500).json(error);
                    }
                );
        }
    };

    controller.updateModel = function(req, res) {

        var _id = req.params.id;

        controller.Model.findByIdAndUpdate(_id, req.body, {new:true}).exec()
            .then(
                function(model) {
                    res.json(model);
                },
                function(error, status) {
                    console.error(error);
                    res.status(500).json(error);
                }
            );

    };

    return controller;
};