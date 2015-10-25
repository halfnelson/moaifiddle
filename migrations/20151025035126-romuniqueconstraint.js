var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.addIndex("fiddlefile", "ix_fiddlefile_rom_unique", [ "rom_hash", "filename","hash" ] , true, callback)
};

exports.down = function(db, callback) {
    db.removeIndex("fiddlefile", "ix_fiddlefile_rom_unique",callback)
};
