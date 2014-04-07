//editor routes
var fiddleRepo = require('../lib/repositories/fiddle_repository');
var Fiddle = require('../lib/models/fiddle');
var D = require('d.js');
var console = require('console');
var b64 = require('../public/javascripts/b64.js');

var show = function(req, res, next) {
    var slug = req.params.slug;
    var revision = req.params.revision || 1;

    var fiddlePromise = null;
    if (slug) {
        fiddlePromise = fiddleRepo.find(slug,revision)
    } else {
        var f = new Fiddle();
        if (req.body.fiddle) {
            f.fiddle = req.body.fiddle;
        }
        fiddlePromise = D.resolved(f);
    }

    console.log('in show');
    fiddlePromise.then(function(fiddle) {
        console.log('got fiddle',fiddle);
        if (!fiddle) {
            res.send(404,"No such fiddle");
            return;
        }
        fiddle.encfiddle = encodeURIComponent(b64.strToBase64(fiddle.fiddle));
        res.render('edit/edit.ejs',{fiddle: fiddle});
    }).error(next);
};

var save = function (req, res,next) {
    var slug = req.params.slug;
    var revision = req.params.revision || 1;
    var fiddleContents = req.body.fiddle;
    var fiddle;
    if (!slug) {
        //new fiddle
        f = new Fiddle();
        f.fiddle = fiddleContents;
        f.revision = 1;
        f.generateSlug();

        fiddle = fiddleRepo.create(f).then(function(res){ console.log(res); return f; })
    } else {
        //get this revision
        fiddle = fiddleRepo.find(slug, revision)
            .then(function (currentFiddle) {
                if (!currentFiddle) {
                    res.send(404, "No such fiddle");
                    return D.rejected("No such fiddle");
                }
                //if we are the same, then don't create a new revision
                if (currentFiddle.fiddle == fiddleContents) {
                    return currentFiddle;
                } else {
                    return fiddleRepo.findLatest(slug)
                        .then(function (latestFiddle) {
                            //create new revision
                            var f = latestFiddle.nextRevision();
                            f.fiddle = fiddleContents;
                            return fiddleRepo.create(f).then(function () {
                                return f
                            });
                        })

                }
            })
    }

    fiddle.then(function(f) {
        res.send({ slug: f.slug, revision: f.revision });
    }).error(next);

};

module.exports = { show: show,
                  save: save }

