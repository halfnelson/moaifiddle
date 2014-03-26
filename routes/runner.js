var b64 = require('../public/javascripts/b64.js');
//var console = require('console');
var run = function(req, res) {
    if (req.body.fiddle) {
        var fiddle = req.body.fiddle;
        fiddle= b64.strToBase64(fiddle);
    } else {
        fiddle = null;
    }
    res.render('runner/index.ejs',{ fiddle: fiddle, layout: false});
};


module.exports = { index: run };

