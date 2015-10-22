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
            f.romhash = req.body.romhash || "legacy";
        } else {
            //default fiddle
            f.fiddle = defaultFiddle;
            f.romhash = "new";
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
        if (!fiddle.romhash) { fiddle.romhash = "legacy"; } //support old static rom versions
        fiddle.encfiddle = encodeURIComponent(b64.strToBase64(fiddle.fiddle));
        res.render('edit/edit.ejs',{fiddle: fiddle});
    }).error(next);
};

var saveRom = function(romHash, romData, romJson) {
    var rom = new Rom();
    rom.hash = romHash;
    rom.romdata = romData;
    rom.json = romJson;
    return romRepo.create(rom)
        .error(function(res) {
            if (res.errno != 19) {
                console.log("rom save failed with error: ", res);
                throw res
            } else {
                return rom;
            }
        })
        .then(function(res) { console.log(res); return rom });
};


var save = function (req, res,next) {
    var slug = req.params.slug;
    var revision = req.params.revision || 1;
    var fiddleContents = req.body.fiddle;
    var romData = req.body.rom;
    var romJson = req.body.json;
    var romHash = md5(romJson+romData);

    var fiddle;
    if (!slug) {
        //new fiddle
        f = new Fiddle();
        f.fiddle = fiddleContents;
        f.revision = 1;
        f.romhash = romHash;
        f.generateSlug();

        fiddle = saveRom(romHash, romData, romJson).then(function () {
            return fiddleRepo.create(f).then(function(res){ console.log(res); return f; })
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
                if (currentFiddle.fiddle == fiddleContents && currentFiddle.romhash == romHash ) {
                    return currentFiddle;
                } else {
                    return fiddleRepo.findLatest(slug)
                        .then(function (latestFiddle) {
                            //create new revision
                            var f = latestFiddle.nextRevision();
                            f.romhash = romHash;
                            f.fiddle = fiddleContents;
                            return saveRom(romHash, romData, romJson).then(function(){
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

