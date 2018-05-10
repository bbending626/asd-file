'use strict'

var referenceHeader = module.exports = function(){
    this.referenceFlag = false;
    this.referenceTime = 0;
    this.spectrumTime = 0;
    this.referenceDesription = '';
    return this;
};