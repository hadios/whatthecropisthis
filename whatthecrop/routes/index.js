var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/farmerUpload', function(req, res, next) {
    res.render('index', {
        message: {
            id: 1,
            body: "World domination!"
        },
        location: {
            place: "New York",
            body: "Rat infestation!"
        }
    });

    res.json({
        message: {
            id: 1,
            body: "World domination!"
        },
        location: {
            place: "New York",
            body: "Rat infestation!"
        }
    });
});

module.exports = router;
