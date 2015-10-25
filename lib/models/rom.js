//define our rom model
var _ = require('underscore');
var md5 = require('md5');


var Rom = function(attributes) {
    //defaults
    this.romdata = '';
    this.json = '';
    attributes = attributes || {};
    //set attributes
    _(Rom.fields).each(function(field) {
       if(attributes[field] !== undefined) {
         this[field] = attributes[field];
       }
    }, this);
};

Rom.fields = [
    'rom_hash','json','romdata'
];

Rom.create = function(json,rombase64) {
    return new Rom(
        {
            json: json,
            romdata: new Buffer(rombase64,'base64'),
            rom_hash: Rom.calculateHash(json, rombase64)
        }
    )
};

Rom.prototype.size = function() {
    return romdata.length;
};


Rom.prototype.filesAndData = function() {
    var jsonObj = JSON.parse(this.json);
    var filesAndData = _(jsonObj.files).map(function(f) {
        var fileData = this.romdata.slice(f.start, f.end);
        return {
            data: fileData,
            filename: f.filename,
            hash: md5(fileData)
        }
    }.bind(this));
    return filesAndData;
};


Rom.calculateHash = function(json, romdata64) {
    var jsonObj = JSON.parse(json);
    var files = _(jsonObj.files).map(function(f){
        return f.filename;
    });
    var allFiles = files.join(',');
    //files and data represent this rom
    //other roms might have same data but different file names so we give them different hash
    return md5(allFiles+romdata64);
};


module.exports = Rom;
