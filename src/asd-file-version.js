'use strict'

var constants = require('./constants');

var asdFileVersion = module.exports = function(){
    this.versionString = constants.VERSION_NOT_VALID;
    this.version = asdFileVersion.prototype.fileVersion.versionInvalid;
    this.isVersionValid = false;
    return this;
};

asdFileVersion.prototype = {
    fileVersion: {
        versionInvalid:0,
        version1:1,
        version2:2,
        version3:3,
        version4:4,
        version5:5,
        version6:6,
        version7:7,
        version8:8,
    },
    isValid: function(value){
        var self = this;
        if(value === constants.VERSION_1){
            self.versionString = value;
            self.version = self.fileVersion.version1;
            self.isVersionValid = true;
        } else if(value === constants.VERSION_2) {
            self.versionString = value;
            self.version = self.fileVersion.version2;
            self.isVersionValid = true;
        } else if(value === constants.VERSION_7) {
            self.versionString = value;
            self.version = self.fileVersion.version7;
            self.isVersionValid = true;
        } else {
            self.versionString = constants.VERSION_NOT_VALID;
            self.version = self.fileVersion.versionInvalid;
            self.isVersionValid = false;
        }
        return self.isVersionValid;
    }
};

