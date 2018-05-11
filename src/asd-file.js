
'use strict'

var fs = require('fs');
var asdFileVersion = require('./asd-file-version');
var spectrumHeader = require('./asd-file-spectrum-header');
var referenceHeader = require('./asd-file-reference-header');

var asdFile = module.exports = function(path, spectrum){
    this.path = path;
    this.spectrum = spectrum;
    this.asdFileVersion = new asdFileVersion();
    this.spectrumHeader = new spectrumHeader();
    this.spectrumBuffer = null;
    this.referenceHeader = new referenceHeader();
    this.referenceBuffer = null;
    return this;
};

asdFile.prototype = {
    exists: function(callback){
        if(callback === null){
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
            callback(err, result);
        });
    },
    read: function(callback){
        if(callback === null){
            throw new Error('callback not defined');
        };
        var self = this;
        
        fs.open(self.path, 'r', function(err, fd){
            if(err === null){
                console.log('%s file opened', self.path);
                if(self._readVersion(fd)){
                    console.log('file version is %s', self.asdFileVersion.versionString);
                    // Read the Spectrum Header
                    self._readSpectrumHeader(fd);
                    // Read the Spectrum buffer
                    self._readSpectrumBuffer(fd);
                    // Multi-Vector file
                    if(self.asdFileVersion.version >= self.asdFileVersion.fileVersion.version2){
                        // Reference Header
                        self._readReferenceHeader(fd);
                        // Reference Buffer
                        self._readReferenceBuffer(fd);
                    }
                    
                } else {
                    console.log('%s file is not a valid ASD file', self.path);
                    //throw error('%s file is not a valid ASD file', self.path);
                };
            };

            if(fd){
                fs.close(fd);
            }

            callback(err);
        });
    },
    _readVersion: function(fd){
        var version = this._readFixedString(fd, 3);
        var isValid = this.asdFileVersion.isValid(version);

        return isValid;
    },
    _readSpectrumHeader: function(fd){
        // comments
        this.spectrumHeader.comments = this._readFixedString(fd, 157);
        // when
        var when = this._readFileSaveTime(fd);
        // program version
        this.spectrumHeader.programVersion = this._readInt8(fd);
        // file version
        this.spectrumHeader.fileVersion = this._readInt8(fd);
        // itime
        this.spectrumHeader.itime = this._readInt8(fd);
        // dc_corr
        this.spectrumHeader.darkCorrected = this._readInt8(fd);
        // dc_time
        this.spectrumHeader.darkTime = this._readDateTime(fd);
        // data_type
        this.spectrumHeader.dataType = this._readInt8(fd);
        // ref time
        this.spectrumHeader.referenceTime = this._readInt32(fd);
        // ch1_wave
        this.spectrumHeader.channel1Wavelength = this._readFloat(fd);
        // wave_step
        this.spectrumHeader.wavelengthStep = this._readFloat(fd);
        // data_format
        this.spectrumHeader.dataFormat = this._readInt8(fd);
        // 3 Unused bytes
        this._readBytes(fd, 3);
        // application
        this.spectrumHeader.application = this._readInt8(fd);
        // channels
        this.spectrumHeader.channels = this._readInt16(fd);
        // APP_DATA
        this.appData = this._readAppData(fd);
        // GPS
        this.gpsData = this._readGpsData(fd);
        // it
        this.spectrumHeader.it = this._readInt32(fd);
        // fo
        this.spectrumHeader.fo = this._readInt16(fd);
        // dcc
        this.spectrumHeader.dcc = this._readInt16(fd);
        // calibration
        this.spectrumHeader.calibration = this._readInt16(fd);
        // instrument number
        this.spectrumHeader.instrumentNum = this._readInt16(fd);
        // ymin
        this.spectrumHeader.yMin = this._readFloat(fd);
        // ymax
        this.spectrumHeader.yMax = this._readFloat(fd);
        // xmin
        this.spectrumHeader.xMin = this._readFloat(fd);
        // xmax
        this.spectrumHeader.xMax = this._readFloat(fd);
        // ip_numbits
        this.spectrumHeader.ipNumBits = this._readInt16(fd);
        // xmode
        this.spectrumHeader.xMode = this._readInt8(fd);
        // flags
        this.spectrumHeader.flags = this._readBytes(fd, 4);
        // dc_count
        this.spectrumHeader.darkCount = this._readInt16(fd);
        // ref_count
        this.spectrumHeader.referenceCount = this._readInt16(fd);
        // sample_count
        this.spectrumHeader.sampleCount = this._readInt16(fd);
        // instrument
        this.spectrumHeader.instrument = this._readInt8(fd);
        // bulb
        this.spectrumHeader.bulb = this._readInt32(fd);
        // swir1_gain
        this.spectrumHeader.swir1Gain = this._readInt16(fd);
        // swir2_gain
        this.spectrumHeader.swir2Gain = this._readInt16(fd);
        // swir1_offset
        this.spectrumHeader.swir1Offset = this._readInt16(fd);
        // swir2_offset
        this.spectrumHeader.swir2Offset = this._readInt16(fd);
        // splice1_wavelength
        this.spectrumHeader.splice1 = this._readFloat(fd);
        // splice2_wavelength
        this.spectrumHeader.splice2 = this._readFloat(fd);
        // 32 bytes not used
        this._readBytes(fd, 32);
    },
    _readSpectrumBuffer: function(fd){
        if(this.asdFileVersion.version > this.asdFileVersion.fileVersion.version1){
            var spectrumBuffer = this._readFloat64Array(fd, this.spectrumHeader.channels);
        } else {
            var spectrumBuffer = this._readFloat32Array(fd, this.spectrumHeader.channels);
        }
    },
    _readReferenceHeader: function(fd){
        // Reference Flag
        this.referenceHeader.referenceFlag = this._readBool(fd);
        // ReferenceTime
        this.referenceHeader.referenceTime = this._readOADateTime(fd);
        // SpectrumTime
        this.referenceHeader.spectrumTime = this._readOADateTime(fd);
        // Reference Description
        this.referenceHeader.referenceDesription = this._readVariableString(fd);
    },
    _readReferenceBuffer: function(fd){
        this.referenceBuffer = this._readFloat64Array(fd, this.spectrumHeader.channels);
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
    _readFileSaveTime: function(fd){
        var dataView = this._getDataView(fd, 18);
        this.spectrumHeader.when.seconds = dataView.getInt16(0, true);     
        this.spectrumHeader.when.minute = dataView.getInt16(2, true);     
        this.spectrumHeader.when.hour = dataView.getInt16(4, true); 
        this.spectrumHeader.when.day = dataView.getInt16(6, true);   
        this.spectrumHeader.when.month = dataView.getInt16(8, true);     
        this.spectrumHeader.when.year = dataView.getInt16(10, true);
        this.spectrumHeader.when.weekDay = dataView.getInt16(12, true);    
        this.spectrumHeader.when.daysInYear = dataView.getInt16(14, true);  
        this.spectrumHeader.when.isDaylighSavings = dataView.getInt16(16, true);
        console.log(this.spectrumHeader.when.getSaveDateTime());
    },
    _readAppData: function(fd){
        const size = 128;
        var dataView = this._getDataView(fd, size);
        var value = '';
        for(var i = 0; i < size; i++){
            var char = dataView.getUint8(i);
            if(char == 0x00){
                break;
            } else {
                value += String.fromCharCode(char);
            };
        };

        return value;
    },
    _readGpsData: function(fd){
        var dataView = this._getDataView(fd, 56);
        this.spectrumHeader.gpsData.true_heading = dataView.getFloat64(0, true);
        this.spectrumHeader.gpsData.speed = dataView.getFloat64(8, true);
        this.spectrumHeader.gpsData.latitude = dataView.getFloat64(16, true);
        this.spectrumHeader.gpsData.longitude = dataView.getFloat64(24, true);
        this.spectrumHeader.gpsData.altitude = dataView.getFloat64(32, true);
        this.spectrumHeader.gpsData.lock = dataView.getInt16(40, true);
        this.spectrumHeader.gpsData.hardware_mode = dataView.getInt8(42);
        this.spectrumHeader.gpsData.ss = dataView.getInt8(43);
        this.spectrumHeader.gpsData.mm = dataView.getInt8(44);
        this.spectrumHeader.gpsData.hh = dataView.getInt8(45);
        this.spectrumHeader.gpsData.flags1 = dataView.getInt8(46);
        this.spectrumHeader.gpsData.flags2 = dataView.getInt16(47);
        this.spectrumHeader.gpsData.satellites[0] = dataView.getInt8(49);
        this.spectrumHeader.gpsData.satellites[1] = dataView.getInt8(50);
        this.spectrumHeader.gpsData.satellites[2] = dataView.getInt8(51);
        this.spectrumHeader.gpsData.satellites[3] = dataView.getInt8(52);
        this.spectrumHeader.gpsData.satellites[4] = dataView.getInt8(53);
        this.spectrumHeader.gpsData.filler[0] = dataView.getInt8(54);
        this.spectrumHeader.gpsData.filler[1] = dataView.getInt8(55);
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
