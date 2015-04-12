var mongoose = require('mongoose');


exports.PestSchema = new mongoose.Schema({
    name        : { type: String, required: true },
    timestamp   : { type: Date }
});
