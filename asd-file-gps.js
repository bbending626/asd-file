'use strict'

var asdFileGps = module.exports = function() {
    this.true_heading = 0;
    this.speed = 0;
    this.latitude = 0;
    this.longitude = 0;
    this.altitude = 0;
    this.lock = 0;
    this.hardware_mode = 0;
    this.ss = 0;
    this.mm = 0;
    this.hh = 0;
    this.flags1 = 0;
    this.flags2 = 0;
    this.satellites = [0,0,0,0,0];
    this.filler = [0,0];
};