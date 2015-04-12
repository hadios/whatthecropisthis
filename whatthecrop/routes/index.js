var express     = require('express');
var mongoose    = require('mongoose');
var http        = require('http');
var router      = express.Router();
// var db      = mongoose.createConnection('localhost', 'pest');

// var PestSchema  = require('../models/pest.js').PestSchema;
// var Pest        = db.model('pests', PestSchema);
//
// var FarmerFormSchema    = require('../models/farmerForm.js').FarmerFormSchema;
// var FarmerForm          = db.model('farmerforms', FarmerFormSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/jsonSend', function(request, response){
  console.log(request.body);      // your JSON
  response.send(request.body);    // echo the result back
});

var _createMessage = function (report, cb) {
    var message = "There's trouble brewing at " + report.state;
    message += "! Beware of the crop monster, " + report.pest;

    return cb(message);
}

var _createAcknowledgement = function (paramaters, cb) {
    var message = "Hey thanks for sending!";

    return cb(message);
}

var _sendResponseMessage = function (farmerForm, cb) {
    _smartAiPredictive(farmerForm, function(prediction) {
        var isBroadcast     = false;

        var singleResponse = {};
        singleResponse.id   = farmerForm.id;
        singleResponse.body = prediction;

        var broadcastResponse = {};
        broadcastResponse.state = farmerForm.state;
        broadcastResponse.body  = prediction;

        var responsePayload = broadcastResponse;
        if (!isBroadcast) {
            responsePayload = singleResponse;
        }

        cb(responsePayload);
    });
}

var _broadcastMessage = function (payload, res, cb) {
    var data = JSON.stringify(payload);
    console.log("Sending payload:" + data);

    var options = {
        host: 'whatthecrop.mybluemix.net',
        port: 80,
        path: '/n/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data)
        }
    };

    var httpreq = http.request(options, function (response) {
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
          console.log("body: " + chunk);
        });
        response.on('end', function() {
            console.log("Successfully send response!");
            cb(payload);
        });

        response.on('error', function (err) {
            payload.body += " Error sending response";
            cb(payload);
        })
    });

    httpreq.write(data);
    httpreq.end();
}

var _smartAiPredictive = function (farmerForm, cb) {
    // HARDCODED !!
    //location = report.location;
    //console.log("Report:" + report);

    var max = 60;
    var min = 4;
    var infestationProbability = Math.floor((Math.random() * ((max + 1) - min)) + min);

    // Check infestation
    if (farmerForm.crop === "SUGARBEET" || farmerForm.pest === "ARMYWORMS" || farmerForm.crop === "RICE" || farmerForm.pest === "RICE SEED MIDGES") {
        farmerForm.message = "There is a " + infestationProbability + "% possibility of " + farmerForm.pest + " infestation in the region. ";

        if (infestationProbability) {
            farmerForm.message += "BEWARE!";
        } else {
            farmerForm.message += farmerForm.crop + " farmer take note! ";
        }
    } else {
        farmerForm.message = "There is a possible " + farmerForm.pest + " infestation in the region. ";
    }

    // Check weather
    var minWeather = 50;
    var maxWeather = 100;
    var weatherTemp = Math.floor((Math.random() * ((maxWeather + 1) - minWeather)) + minWeather);
    farmerForm.message += "Weather is at " + weatherTemp + " F with high range precipitation. ";

    // Check natural causes/disasters
    var minCause = 0;
    var maxCause = 2;
    var causeIndex = Math.floor((Math.random() * ((maxFire + 1) - minFire)) + minFire);

    switch (causeIndex) {
        case 0:
            farmerForm.message += "Take note of possible short-term drought in June 2015. ";
            break;

        case 1:
            farmerForm.message += "Possible flash flood in flood-prone zones in July 2015. ";
            break;

        case 2:
            farmerForm.message += "Rainy days are expected in the coming weeks. ";
            break;
    };

    // Check fire
    var minFire = 0;
    var maxFire = 5;
    var fireCount = Math.floor((Math.random() * ((maxFire + 1) - minFire)) + minFire);
    if (fireCount > 0) {
        farmerForm.message += "There are " + fireCount + " active fire areas spotted nearby. ";
    }

    farmerForm.message += "Have a good harvest!";
    // if (farmerForm.crop === "SUGARBEET" || farmerForm.pest === "ARMYWORMS") {
    //     farmerForm.message = "There is a " + infestationProbability + " possibility of " + farmerForm.pest + " infestation in the region. ";
    //     farmerForm.message += "Weather is at 70 F with medium range precipitation. ";
    //     farmerForm.message += "Take note of possible short-term drought in June 2015. ";
    //     farmerForm.message += "There are 3 active fire areas spotted nearby. ";
    // } else if (farmerForm.crop === "RICE" || farmerForm.pest === "RICE SEED MIDGES") {
    //     farmerForm.message = "There is a " + infestationProbability + " possibility of " + farmerForm.pest + " infestation in the region. ";
    //     farmerForm.message += "Weather is at 67 F with high range precipitation. ";
    //     farmerForm.message += "Possible flash flood in flood-prone zones in July 2015. ";
    //     farmerForm.message += "There are 5 active fire areas spotted nearby.";
    // } else {
    //     farmerForm.message = "There is a possible " + farmerForm.pest + " infestation in the region. ";
    //     farmerForm.message += "Rainy days are expected in the coming weeks. ";
    //     farmerForm.message += "Have a good harvest!";
    // }

    // Determine to send single or broadcast
    cb(farmerForm);
}

router.post('/wtc', function(req, res, next) {
    // Get the farmer message
    var report = {};
    var formObj;

    if (req.body.id) {
        var formObj = {
            id      : req.body.id,
            crop    : req.body.crop.toUpperCase(),
            pest    : req.body.pest.toUpperCase(),
            harvest : req.body.harvest,
            state   : req.body.state
        };
    } else if (req.body.payload) {
        // Report structure
        // payload = {
        //        'id': farm_data.raw_log.pk,
        //        'crop': farm_data.crop,
        //        'pest': farm_data.pest,
        //        'harvest': farm_data.harvest,
        //        'media_url': farm_data.media_url,
        //        'state': farm_data.state,
        //    }

        report = JSON.parse(req.body.payload);

        formObj = {
            id      : report.id,
            crop    : report.crop,
            pest    : report.pest,
            harvest : report.harvest,
            state   : report.state
        };

        // Save the report
        // var newForm = new FarmerForm(formObj);
        // newForm.save(function(err, doc) {
        //     if(err || !doc) {
        //       throw 'Error';
        //     } else {
        //         _smartAiPredictive(newForm, function () {
        //             _sendResponseMessage(newForm);
        //         });
        //     }
        // });
    } else {
        var formObj = {
            id      : 1,
            crop    : 'apple',
            pest    : 'Space locust',
            harvest : '42%',
            state   : 'NY',
        };
    }

    _sendResponseMessage(formObj, function (response) {
        _broadcastMessage (response, res, function () {
            return res.format({
                // html: function() {
                //     res.render('main', {
                //         report: report,
                //         payload: broadcastResponse
                //     });
                // },

                json: function() {
                    res.send({
                        payload: response
                    });
                }
            });
        });
    });
});

module.exports = router;
