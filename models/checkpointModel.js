const mongoose = require('mongoose');

module.exports = function() {

    let schema = mongoose.Schema({
        sprintID:{
            type: Number,
            required: true
        },
        checkpointType:{
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now,
            required: true
        },
        issues: {
            type: Array
        },
    });

    return mongoose.model('CheckPoint', schema);
};