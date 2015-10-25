var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('fiddlefile', {
        rom_hash: { type: 'string', notNull: true },
        filename: 'string',
        hash: { type: 'string', notNull: true }
    }, function() {
        db.addIndex("fiddlefile", "ix_fiddlefile_rom_hash", "rom_hash", false, callback)
    });
};

exports.down = function(db, callback) {
    db.dropTable('fiddlefile', function() {
      db.removeIndex("fiddlefile", "ix_fiddlefile_rom_hash", callback)
    });
};
