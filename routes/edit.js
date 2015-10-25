//editor routes
var fiddleRepo = require('../lib/repositories/fiddle_repository');
var romRepo = require('../lib/repositories/rom_repository');
var Fiddle = require('../lib/models/fiddle');
var Rom = require('../lib/models/rom');
var D = require('d.js');
var console = require('console');
var b64 = require('../public/javascripts/b64.js');
var fs = require('fs');
var defaultFiddle = fs.readFileSync(__dirname+ "/../data/defaultfiddle.lua", 'utf8');
var md5 = require('md5');

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
            f.rom_hash = req.body.rom_hash || "legacy";
        } else {
            //default fiddle
            f.fiddle = defaultFiddle;
            f.rom_hash = "new";
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
        if (!fiddle.rom_hash) { fiddle.rom_hash = "legacy"; } //support old static rom versions
        fiddle.encfiddle = encodeURIComponent(b64.strToBase64(fiddle.fiddle));
        res.render('edit/edit.ejs',{fiddle: fiddle});
    }).error(next);
};

var saveRom = function(rom) {
    return romRepo.create(rom)
        .then(function(res) { console.log(res); return rom }).error(function(err) {
        console.log("error saving rom", err);
    });
};


var save = function (req, res,next) {
    var slug = req.params.slug;
    var revision = req.params.revision || 1;
    var fiddleContents = req.body.fiddle;
    var romData = req.body.rom;
    var romJson = req.body.json;

    var r = Rom.create(romJson,romData);

    var fiddle;
    if (!slug) {
        //new rom

        //new fiddle
        var f = new Fiddle();
        f.fiddle = fiddleContents;
        f.revision = 1;
        f.rom_hash = r.rom_hash;
        f.generateSlug();

        fiddle = saveRom(r).then(function () {
            return fiddleRepo.create(f).then(function(res){ console.log(res); return f; }).error(next)
        })
    } else {
        //get this revision
        fiddle = fiddleRepo.find(slug, revision)
            .then(function (currentFiddle) {
                if (!currentFiddle) {
                    res.send(404, "No such fiddle");
                    return D.rejected("No such fiddle");
                }
                //if we are the same, then don't create a new revision
                if (currentFiddle.fiddle == fiddleContents && currentFiddle.rom_hash == r.rom_hash ) {
                    return currentFiddle;
                } else {
                    return fiddleRepo.findLatest(slug)
                        .then(function (latestFiddle) {
                            //create new revision
                            var f = latestFiddle.nextRevision();
                            f.rom_hash = r.rom_hash;
                            f.fiddle = fiddleContents;
                            return saveRom(r).then(function(){
                                return fiddleRepo.create(f).then(function () {
                                    return f
                                });
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

