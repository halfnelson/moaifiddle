var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.addIndex("roms", "ix_romhash", "hash", true, callback)
};

exports.down = function(db, callback) {
    db.removeIndex("roms","ix_romhash", callback)
};
