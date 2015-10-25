var Rom = require('../models/rom');
var _ = require('underscore');
var D = require('d.js');
var db = require('../db');
var console = require('console');

function RomRepository(db) {
    this.db = db;
}


function romToRows(rom) {
    return rom.filesAndData();
}

function rowsToRom(rom_hash, rows) {

        //loop over this.files and construct a new arraybuffer
        var files = rows;
        var newFiles = [];
        var newDirs = [];
        //transform data to buffers
        _(rows).each(function(f) {
            f.data = new Uint8Array(new Buffer(f.romdata,'base64'));
        });

        var size = _.reduce(files, function (sizeSoFar, file) {
            return sizeSoFar + file.data.length;
        }, 0);
        var newBuff = new Uint8Array(size);
        var offset = 0;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var newFile = {
                audio: "0",
                crunched: "0",
                filename: file.filename,
                start: offset,
                end: offset + file.data.length
            };
            newFiles.push(newFile);
            //collect directories as we go
            var dir = file.filename.split("/").slice(1).slice(0, -1).join("/");
            if (newDirs.indexOf(dir) == -1) {
                newDirs.push(dir);
            }
            //copy in our data
            newBuff.set(file.data, offset);
            offset = newFile.end;
        }

        var romJson = {
            files: newFiles,
            package_uuid: rom_hash,
            bundle_file: "moaiapp.rom",
            directories: newDirs
        };

        return new Rom({
            json: romJson,
            romdata: new Buffer(newBuff),
            rom_hash: rom_hash
        });
}


RomRepository.prototype.loadRomRows = function(rom_hash) {
    return this.db.queryRows('select rom_hash, filename, romdata '+
        ' from fiddlefile as f inner join roms as r on f.hash = r.hash '+
        ' where f.rom_hash = ?',[rom_hash]);
};

//repository
RomRepository.prototype.find = function(rom_hash) {
   if (!rom_hash) return D.rejected('no rom_hash given');
   return this.loadRomRows(rom_hash)
      .then(function(result) {
          if (!result) return null;
          return rowsToRom(rom_hash, result);
       });
};

function ignoreDuplicateError(dbprom) {
    return dbprom.error(function(res) {
        if (res.errno != 19) {
            console.log("rom save failed with error: ", res);
            throw res
        } else {
            return true;
        }
    })
}

RomRepository.prototype.create =  function(rom) {
    var rows = romToRows(rom);

    var inserts = [];
    _(rows).each(function(row) {
        var fileInsert =  this.db.queryRows('insert into fiddlefile (rom_hash, filename, hash) values (?,?,?)', [ rom.rom_hash, row.filename, row.hash] );
        var romInsert =  this.db.queryRows('insert into roms (hash, romdata, created, size) values (?,?,?,?)', [ row.hash, row.data.toString('base64'), new Date(), row.data.length] );
        inserts.push(ignoreDuplicateError(fileInsert));
        inserts.push(ignoreDuplicateError(romInsert));
    }.bind(this));

    return D.all(inserts).error(function(err) {
        console.log("Failure in rom create, ", err);
    });
};

module.exports = new RomRepository(db);