'use strict'

var utility = module.exports = function(){
    this.version = '';
    return this;
};

utility.prototype = {
    arrayToString: function(value){
        var returnValue = '';
        if(value != undefined){
            for(let i = 0; i < value.length; i++){
                var char = value[i];
                if(value[i] != 0x00){
                    returnValue += String.fromCharCode(char);
                };
            };
        };
        return returnValue;
    }
};