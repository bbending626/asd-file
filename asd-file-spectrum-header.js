'use strict'

var constants = require('./constants');
var asdFileWhen = require('./asd-file-when');
var asdFileGps = require('./asd-file-gps');

var spectrumHeader = module.exports = function(){
    this.co = constants.VERSION_NOT_VALID;
    this.serialNumber = 0
    this.calibrationNumber = 0;
    this.comment = '';
    this.when = new asdFileWhen();
    this.programVersion = 0;
    this.fileVersion = 0;
    this.itime = 0;
    this.darkCorrected = 0;
    this.darkTime = 0;
    this.dataType = 0;
    this.referenceTime = 0;
    this.channel1Wavelength = 0;
    this.wavelengthStep = 0;
    this.dataFormat = 0;
    this.application = 0;
    this.channels = 0;
    this.appData = '';
    this.gpsData = new asdFileGps();
    this.fo = 0;
    this.it = 0;
    this.dcc = 0;
    this.calibration = 0;
    this.instrumentNumber = 0;
    this.yMin = 0;
    this.yMax = 0;
    this.xMin = 0;
    this.xMax = 0;
    this.ipNumBits = 0;
    this.xMode = 0;
    this.flags = 0;
    this.darkCount = 0;
    this.referenceCount = 0;
    this.sampleCount = 0;
    this.instrument = 0;
    this.bulb = 0;
    this.swir1Gain = 0;
    this.swir1Offset = 0;
    this.swir2Gain = 0;
    this.swir2Offset = 0;
    this.splice1 = 0;
    this.splice2 = 0;
    return this;
};




