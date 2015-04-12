var mongoose = require('mongoose');


exports.FarmerFormSchema = new mongoose.Schema({
    id          : { type: Number, required: true },
    crop        : { type: String },
    pest        : { type: String },
    harvest     : { type: String },
    state       : { type: String },
    timeStamp   : { type: Date, default: Date.now },
});

// Report structure
// payload = {
//        'id': farm_data.raw_log.pk,
//        'crop': farm_data.crop,
//        'pest': farm_data.pest,
//        'harvest': farm_data.harvest,
//        'media_url': farm_data.media_url,
//        'state': farm_data.state,
//    }
