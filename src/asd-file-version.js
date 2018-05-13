'use strict'

var constants = require('./constants');

var asdFileVersion = module.exports = function(version){
    this.versionString = constants.VERSION_NOT_VALID;
    this.version = asdFileVersion.prototype.fileVersion.versionInvalid;
    this.isVersionValid = false;
    this.setVersion(version);
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
        var isVersionValid = false;
        if(value === constants.VERSION_1 || 
           value === constants.VERSION_2 ||
           value === constants.VERSION_7){
            isVersionValid = true;
        };

        return isVersionValid;
    },
    setVersion: function(value){
        var self = this;
        
        if(value === self.fileVersion.version1 ||
           value === constants.VERSION_1){
            self.version = self.fileVersion.version1;
            self.versionString = constants.VERSION_1;
            self.isVersionValid = true;
        } else if(value === self.fileVersion.version2 ||
                  value === constants.VERSION_2){
            self.version = self.fileVersion.version2;
            self.versionString = constants.VERSION_2;
            self.isVersionValid = true;
        } else if(value === self.fileVersion.version7 ||
                  value === constants.VERSION_7){
            self.version = self.fileVersion.version7;
            self.versionString = constants.VERSION_7;
            self.isVersionValid = true;
        } else {
            self.version = self.fileVersion.versionInvalid;
            self.versionString = constants.VERSION_NOT_VALID;
            self.isVersionValid = false;
        }
    }
};

