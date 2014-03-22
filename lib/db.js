var anyDB = require('any-db');
var D = require('d.js');
var es = require('event-stream');
var _ = require('underscore');
var dbURL =  'sqlite3://fiddle.db';
var pool = anyDB.createPool(dbURL, {min: 2, max: 20});

//return the result as a stream of row objects instead of a stream of array of values
pool.queryRowsStream = function() {
    var q = this.query.apply(this, arguments);
    var fields = [];
    q.on('fields', function(queryFields) {
        fields = queryFields;
    });
    var valsToRow = function(data) {
        this.emit('data', _.object(fields,data));
    };
    return q.pipe(es.through(valsToRow));
};

//return the result as an array of row objects to a callback
pool.queryRowsCB = function() {
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop;
    var q = this.queryRowsStream.apply(this, args);
    q.pipe(es.writeArray(callback));
};

//return the result as a promise for an array of row objects
pool.queryRows = D.nodeCapsule(pool,pool.queryRowsCB);




module.exports = pool;


