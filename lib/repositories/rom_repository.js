var db = require('../db');
var Rom = require('../models/rom');
var _ = require('underscore');

function RomRepository(db) {
    this.db = db;
}

//mappings model=>row
var ModelToRowMapping = { 'id':'id', 'hash':'hash','json':'json','romdata':'romdata','created':'created' };
var RowToModelMapping = _(ModelToRowMapping).invert();

function romAsRow(rom) {
    var romRow = {};
    _(ModelToRowMapping).each(function(rowField,modelField) {
        if (rom[modelField] !== undefined) {
            romRow[rowField] = rom[modelField];
        }
    });
    return romRow;
}

function rowAsRom(row) {
    var romAttr = {};
    _(RowToModelMapping).each(function(modelField,rowField) {
        if (row[rowField] !== undefined) {
            romAttr[modelField] = row[rowField];
        }
    });
    return new Rom(romAttr);
}


//repository
RomRepository.prototype.find = function(hash) {
   if (!hash) return D.rejected('no hash given');
   return this.db.queryRows('select * from roms where hash = ?',[hash])
       .then(function(result) {
           return (result && result.length > 0) ? rowAsRom(result[0]): null;
       });
};

RomRepository.prototype.create =  function(rom) {
    if (!rom) return D.rejected('no rom given for create');
    var row = romAsRow(rom);
    var cols = _(row).keys();
    var values = _(row).values();
    var params = _(values).map(function(v) { return '?' }).join(', ');
    return this.db.queryRows('insert into roms ('+cols.join(', ')+')  values ('+params+')',values)
};

module.exports = new RomRepository(db);