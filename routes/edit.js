//editor routes
var fiddleRepo = require('../lib/repositories/fiddle_repository');
var Fiddle = require('../lib/models/fiddle');
var D = require('d.js');
var console = require('console');

var show = function(req, res, next) {
    var slug = req.params.slug;
    var revision = req.params.revision || 1;

    var fiddlePromise = slug ?  fiddleRepo.find(slug,revision) : D.resolved(new Fiddle());

    console.log('in show');
    fiddlePromise.then(function(fiddle) {
        console.log('got fiddle',fiddle);
        if (!fiddle) {
            res.send(404,"No such fiddle");
            return;
        }
        res.render('edit/edit',fiddle);
    }).error(next);
};

var save = function (req, res) {

};

module.exports = { show: show,
                  save: save }

