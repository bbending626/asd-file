
'use strict'

var fs = require('fs');
var asdFileVersion = require('./asd-file-version');


var asdFile = module.exports = function(path, spectrum){
    this.path = path;
    this.spectrum = spectrum;
    this.asdFileVersion = new asdFileVersion();
    return this;
};

asdFile.prototype = {
    exists: function(cb){
        if(cb === null){
            throw new Error('callback not defined');
        }
        var self = this;
        fs.stat(self.path, function(err, stat){
            var result = false;
            if(err === null){
                console.log('%s exists', self.path);
                result = true;
            } else if(err.code == 'ENOENT') {
                console.log('%s directory or file does not exist', self.path);
            } else {
                console.log('%d error ', err.code);
            }
            cb(err, result);
        });
    },

    read: function(cb){
        if(cb === null){
            throw new Error('callback not defined');
        };
        var self = this;
        
        fs.open(self.path, 'r', function(err, fd){
            if(err === null){
                console.log('%s file opened', self.path);
                if(self._readVersion(fd)){
                    console.log('file version is %s', self.asdFileVersion.versionString);
                    // comments
                    self.spectrum.comments = self._readFixedString(fd, 157);
                    // when
                    var when = self._readBytes(fd, 18);
                    // program version
                    var program_version = self._readInt8(fd);
                    // file version
                    var file_version = self._readInt8(fd);
                    // itime
                    var itime = self._readInt8(fd);
                    // dc_corr
                    var dc_corr = self._readInt8(fd);
                    // dc_time
                    var dc_time = self._readDateTime(fd);
                    // data_type
                    var data_type = self._readInt8(fd);
                    // ref time
                    var ref_time = self._readInt32(fd);
                    // ch1_wave
                    var ch1_wave = self._readFloat(fd);
                    // wave_step
                    var wave_step = self._readFloat(fd);
                    // data_format
                    var data_format = self._readInt8(fd);
                    // 3 Unused bytes
                    self._readBytes(fd, 3);
                    // application
                    var application = self._readInt8(fd);
                    // channels
                    var channels = self._readInt16(fd);
                    // APP_DATA
                    self._readBytes(fd, 128);
                    // GPS
                    self._readBytes(fd, 56);
                    // it
                    var it = self._readInt32(fd);
                    // fo
                    var fo = self._readInt16(fd);
                    // dcc
                    var dcc = self._readInt16(fd);
                    // calibration
                    var calibration = self._readInt16(fd);
                    // instrument number
                    var instrument_num = self._readInt16(fd);
                    // ymin
                    var ymin = self._readFloat(fd);
                    // ymax
                    var ymax = self._readFloat(fd);
                    // xmin
                    var xmin = self._readFloat(fd);
                    // xmax
                    var xmax = self._readFloat(fd);
                    // ip_numbits
                    var ip_numbits = self._readInt16(fd);
                    // xmode
                    var xmode = self._readInt8(fd);
                    // flags
                    var flags = self._readBytes(fd, 4);
                    // dc_count
                    var dc_count = self._readInt16(fd);
                    // ref_count
                    var ref_count = self._readInt16(fd);
                    // sample_count
                    var sample_count = self._readInt16(fd);
                    // instrument
                    var instrument = self._readInt8(fd);
                    // bulb
                    var bulb = self._readInt32(fd);
                    // swir1_gain
                    var swir1_gain = self._readInt16(fd);
                    // swir2_gain
                    var swir2_gain = self._readInt16(fd);
                    // swir1_offset
                    var swir1_offset = self._readInt16(fd);
                    // swir2_offset
                    var swir2_offset = self._readInt16(fd);
                    // splice1_wavelength
                    var splice1_wavelength = self._readFloat(fd);
                    // splice2_wavelength
                    var splice2_wavelength = self._readFloat(fd);
                    // 32 bytes not used
                    self._readBytes(fd, 32);
                    // Spectrum buffer
                    if(self.asdFileVersion.version > self.asdFileVersion.fileVersion.version1){
                        var spectrumBuffer = self._readFloat64Array(fd, channels);
                    } else {
                        var spectrumBuffer = self._readFloat32Array(fd, channels);
                    }
                    // Reference Header
                    // Reference Flag
                    var referenceFlag = self._readBool(fd);
                    // ReferenceTime
                    var referenceTime = self._readOADateTime(fd);
                    // SpectrumTime
                    var spectrumTime = self._readOADateTime(fd);
                    // Reference Description
                    var referenceDesription = self._readVariableString(fd);
                    // Reference Buffer
                    var referenceBuffer = self._readFloat64Array(fd, channels);

                } else {
                    console.log('%s file is not a valid ASD file', self.path);
                    //throw error('%s file is not a valid ASD file', self.path);
                };
            };

            if(fd){
                fs.close(fd);
            }

            cb(err);
        });
    },
    _readVersion: function(fd){
        var version = this._readFixedString(fd, 3);
        var isValid = this.asdFileVersion.isValid(version);

        return isValid;
    },
    _readBytes: function(fd, size){
        var buffer = new Buffer(size);
        fs.readSync(fd, buffer, 0, size, null);
        return buffer;
    },
    _readInt8: function(fd){
        var dataView = this._getDataView(fd, 1)
        var value = dataView.getInt8(0);

        return value;
    },
    _readBool: function(fd){
        var dataView = this._getDataView(fd, 2);
        var value = dataView.getInt16(0);
        
        return Boolean(value);
    },
    _readInt16: function(fd){
        var dataView = this._getDataView(fd, 2)
        var value = dataView.getInt16(0, true);

        return value;
    },
    _readInt32: function(fd){
        var dataView = this._getDataView(fd, 4)
        var value = dataView.getInt32(0, true);

        return value;
    },
    _readFloat: function(fd){
        var dataView = this._getDataView(fd, 4)
        var value = dataView.getFloat32(0, true);

        return value;
    },
    _readFloat32Array: function(fd, size){
        var dataView = this._getDataView(fd, size * 4)
        var float32Array = new Float64Array(size);

        for(var i = 0; i < size; i++){
            float32Array[i] = dataView.getFloat32(i * 4, true);
        };
       
        return float32Array;
    },
    _readFloat64Array: function(fd, size){
        var dataView = this._getDataView(fd, size * 8)
        var float64Array = new Float64Array(size);

        for(var i = 0; i < size; i++){
            float64Array[i] = dataView.getFloat64(i * 8, true);
        };
       
        return float64Array;
    },
    _readFixedString: function(fd, size){
        var value = '';
        var dataView = this._getDataView(fd, size)
        
        for(var i = 0; i < size; i++){
            var char = dataView.getUint8(i);
            if(char != 0x00){
                value += String.fromCharCode(char);
            };
        };

        return value;
    },
    _readVariableString: function(fd){
        var value = '';
        // Read next 2 bytes to get the size of the string
        var size = this._readInt16(fd);
        // Read the string if size is greater than zero
        if(size){
            value = this._readFixedString(fd, size);
        };
        
        return value;
    },
    _readOADateTime: function(fd){
        var dataView = this._getDataView(fd, 8)
        var value = dataView.getFloat64(0, true);
        var epoch = new Date(Date.UTC(1899, 11, 30, 0, 0, 0, 0));
        var msPerDay = 86400000;

        var oaDateTime = new Date(value * msPerDay + +epoch)

        return oaDateTime; 
    },
    _readDateTime: function(fd){
        var dataView = this._getDataView(fd, 4)
        var value = dataView.getInt32(0, true);
        var epoch = new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0));
        console.log(epoch);
        
        var now = new Date();
        var stdTimeZoneOffset = function(){
            var janOffset = new Date(now.getFullYear(), 0, 1);
            var julOffset = new Date(now.getFullYear(), 6, 1);
            return Math.min(janOffset.getTimezoneOffset(), julOffset.getTimezoneOffset());
        };

        var isDayLightSavings = function(){
            return now.getTimezoneOffset() < stdTimeZoneOffset();
        };

        var timeZoneOffset = function(){
            var offset = now.getTimezoneOffset();
            if(isDayLightSavings()){
                offset += 60;
            };
            return offset;
        };

        var dateTime = new Date((value * 1000) + +epoch - (timeZoneOffset() * 60 * 1000));
        
        return dateTime;
    },
    _getDataView: function(fd, size){
        var buffer = new Buffer(size);
        fs.readSync(fd, buffer, 0, size, null);
        
        var arrayBuffer = new ArrayBuffer(buffer.length);
        var dataView = new DataView(arrayBuffer);
        
        buffer.forEach(function(value, index){
            dataView.setUint8(index, value);
        });

        return dataView;
    },
    _writeOADateTime: function(fd, date){
        var arrayBuffer = new ArrayBuffer(8);
        var dataView = new DataView(arrayBuffer);
        var epoch = new Date(Date.UTC(1899, 11, 30, 0, 0, 0, 0));
        var msPerDay = 86400000;

        var value = -1 * (epoch - date)/msPerDay;
        view.setFloat64(0, value, true);

        fs.writeSync(fd, view.buffer, 8);
    },
};
