var b64 = require('../public/javascripts/b64.js');
var fiddleRepo = require('../lib/repositories/fiddle_repository');
var Fiddle = require('../lib/models/fiddle');
var console = require('console');
var D = require('d.js');

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

var embed = function(req, res) {
    var slug = req.params.slug;
    var revision = req.params.revision || 1;
    var fiddlePromise = slug ?  fiddleRepo.find(slug,revision) : D.resolved(null);

    fiddlePromise.then(function(fiddle) {
        if (!fiddle) {
            res.render('runner/embed-notfound.ejs');
            return;
        }
        fiddle.encfiddle = encodeURIComponent(b64.strToBase64(fiddle.fiddle));
        res.render('runner/embed.ejs',{fiddle: fiddle, layout: false});
    }).error(function(e){ console.log("Error:",e) });
};


module.exports = { index: run, embed: embed };

