var anyDB = require('any-db');

var dbURL =  'sqlite3://fiddle.db';

var pool = anyDB.createPool(dbURL, {min: 2, max: 20});

module.exports = pool;

