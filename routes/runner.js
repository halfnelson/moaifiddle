var b64 = require('../public/javascripts/b64.js');
//var console = require('console');
var run = function(req, res) {
    var fiddle = req.body.fiddle;
    fiddle= b64.strToBase64(fiddle);
    res.render('runner/index',{ fiddle: fiddle, layout: false});
};

module.exports = { index: run };

