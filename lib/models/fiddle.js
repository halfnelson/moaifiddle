//define our fiddle model
var _ = require('underscore');

/**
 *  Javascript AlphabeticID class
 *  (based on a script by Kevin van Zonneveld &lt;kevin@vanzonneveld.net>)
 *
 *  Author: Even Simon &lt;even.simon@gmail.com>
 *
 *  Description: Translates a numeric identifier into a short string and backwords.
 *
 *  Usage:
 *    var str = AlphabeticID.encode(9007199254740989); // str = 'fE2XnNGpF'
 *    var id = AlphabeticID.decode('fE2XnNGpF'); // id = 9007199254740989;
 **/

var AlphabeticID = {
    index:'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',

    /**
     *  @function AlphabeticID.encode
     *  @description Encode a number into short string
     *  @param integer
     *  @return string
     **/
    encode:function(_number){
        if('undefined' == typeof _number){
            return null;
        }
        else if('number' != typeof(_number)){
            throw new Error('Wrong parameter type');
        }

        var ret = '';

        for(var i=Math.floor(Math.log(parseInt(_number))/Math.log(AlphabeticID.index.length));i>=0;i--){
            ret = ret + AlphabeticID.index.substr((Math.floor(parseInt(_number) / AlphabeticID.bcpow(AlphabeticID.index.length, i)) % AlphabeticID.index.length),1);
        }

        return ret.split('').reverse().join('');
    },
    bcpow:function(_a, _b){
        return Math.floor(Math.pow(parseFloat(_a), parseInt(_b)));
    }
};

var Fiddle = function(attributes) {
    //defaults
    this.revision = 1;
    this.created = new Date();
    this.fiddle = '';
    //create a slug
    this.slug = AlphabeticID.encode(Math.floor(Math.random()*100)*Math.pow(10,13)+this.created.valueOf());

    attributes = attributes || {};
    //set attributes
    _(Fiddle.fields).each(function(field) {
       if(attributes[field] !== undefined) {
         this[field] = attributes[field];
       }
    }, this);
};

Fiddle.fields = [
    'id', 'slug','user_id','revision','fiddle','created'
];

module.exports = Fiddle;
