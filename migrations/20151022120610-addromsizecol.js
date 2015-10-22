var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.addColumn('roms', 'size', {
        type: 'int'
    }, callback)
};

exports.down = function(db, callback) {

};
