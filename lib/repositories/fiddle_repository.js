var db = require('../db');
var Fiddle = require('../models/fiddle');
var _ = require('underscore');

function FiddleRepository(db) {
    this.db = db;
}

//mappings model=>row
var ModelToRowMapping = { 'id':'id', 'slug':'slug','user_id':'user_id','revision':'revision','fiddle':'fiddle','created':'created' };
var RowToModelMapping = _(ModelToRowMapping).invert();

function fiddleAsRow(fiddle) {
    var fiddleRow = {};
    ModelToRowMapping.each(function(rowField,modelField) {
        if (fiddle[modelField] !== undefined) {
            fiddleRow[rowField] = fiddle[modelField];
        }
    });
    return fiddleRow;
}

function RowAsFiddle(row) {
    var fiddleAttr = {};
    RowToModelMapping.each(function(modelField,rowField) {
        if (row[rowField] !== undefined) {
            fiddleAttr[modelField] = row[rowField];
        }
    });
    return new Fiddle(fiddleAttr);
}


//repository
FiddleRepository.prototype.find = function(slug, revision) {
   revision = revision || 1;
   if (!slug) return D.rejected('no slug given');
   return this.db.queryRows('select * from fiddles where slug = ? and revision = ?',[slug,revision])
       .then(function(rows) {
           return (rows && rows.length > 0) ? RowAsFiddle(rows[0]): null;
       });
};

FiddleRepository.prototype.create =  function(fiddle) {
    if (!fiddle) return D.rejected('no fiddle given for create');
    var row = fiddleAsRow(fiddle);
    var cols = _(row).keys();
    var values = _(row).values();
    var params = _(values).map(function(v) { return '?' }).join(', ');
    return this.db.queryRows('insert into fiddles ('+cols.join(', ')+')  values ('+params+')',values)
};

module.exports = new FiddleRepository(db);