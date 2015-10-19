var dbm = require('db-migrate');
var type = dbm.dataType;

function createRomTable(db, callback) {
    db.createTable('roms', {
        id: { type: 'int', primaryKey: true, autoIncrement: true },
        hash: { type: 'string', notNull: true },
        json: 'text',
        romdata: 'text',
        created: 'datetime'
    }, callback);
}

function addRomColumn(db, callback) {
    db.addColumn('fiddles', 'romid', {
        type: 'int', defaultValue: -1
    }, callback)
}

exports.up = function(db, callback) {
   createRomTable(db, function(err) {
       if (err) {
           callback(err)
       } else {
            addRomColumn(db, callback)
       }
   })
};

exports.down = function(db, callback) {
    db.removeColumn("fiddles", "romid", function(err) {
        if (err) {
            callback(err);
        } else {
            db.dropTable('roms', callback)
        }
    })
};
