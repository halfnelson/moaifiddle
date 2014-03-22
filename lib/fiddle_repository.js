
var db = require('db');

function FiddleRepository(db) {
    this.db = db;
}

FiddleRepository.prototype.find = function(slug, revision) {
   revision = revision || 1;
   if (!slug) return D.rejected('no slug given');
   return this.db.queryRowsProm('select * from fiddles where slug = ? and revision = ?',[slug,revision]);
};

