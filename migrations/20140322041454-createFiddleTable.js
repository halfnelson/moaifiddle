var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
    db.createTable('fiddles', {
        id: { type: 'int', primaryKey: true, autoIncrement: true },
        slug: { type: 'string', unique: true, notNull: true },
        user_id: 'int',
        revision: {type: 'int', defaultValue: 1},
        fiddle: 'text',
        created: 'datetime'
    }, callback);
};

exports.down = function(db, callback) {
   db.dropTable('fiddles');
};
