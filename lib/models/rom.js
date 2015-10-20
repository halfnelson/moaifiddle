//define our rom model
var _ = require('underscore');


var Rom = function(attributes) {
    //defaults
    this.hash = '';
    this.created = new Date();
    this.json = '';
    this.romdata = '';
    attributes = attributes || {};
    //set attributes
    _(Rom.fields).each(function(field) {
       if(attributes[field] !== undefined) {
         this[field] = attributes[field];
       }
    }, this);
};

Rom.fields = [
    'id', 'hash','json','romdata','created'
];

module.exports = Rom;
