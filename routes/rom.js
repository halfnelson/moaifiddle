//rom routes
var romRepo = require('../lib/repositories/rom_repository');


var rom = function(req, res, next) {
    if (req.params.romhash == "legacy") {
        return legacyRom(req,res,next);
    }

    if (req.params.romhash == 'new') {
        return newFiddleRom(req, res, next);
    }

    return legacyRom(req,res,next);
};

var legacyRom = function(req, res, next) {
   res.sendfile("public/roms/legacydefault.rom", {maxAge: 60*60*24*365});
};

var newFiddleRom = function(req, res) {
    res.sendfile("public/roms/newfiddle.rom", {maxAge: 60*60*24});
};


var json = function (req, res, next) {
    if (req.params.romhash == "legacy") {
        return legacyJson(req,res,next);
    }

    if (req.params.romhash == 'new') {
        return newFiddleJson(req, res, next);
    }

    return legacyJson(req,res,next);
};

var legacyJson = function(req, res, next) {
    res.sendfile("public/roms/legacydefault.rom.json", {maxAge: 60*60*24*365});
};

var newFiddleJson = function(req, res) {
    res.sendfile("public/roms/newfiddle.rom.json", {maxAge: 60*60*24});
};


module.exports = { rom: rom,
                  json: json };

