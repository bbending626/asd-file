
'use strict'

var fs = require('fs');
var path = require('path');
var asdFileVersion = require('./asd-file-version');
var spectrumHeader = require('./asd-file-spectrum-header');
var referenceHeader = require('./asd-file-reference-header');

var asdFile = module.exports = function(path, version, spectrum){
    this.path = path;
    this.spectrum = spectrum;
    this.asdFileVersion = new asdFileVersion(version);
    this.spectrumHeader = new spectrumHeader();
    this.spectrumHeader.co = this.asdFileVersion.versionString;
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
                //console.log('%s exists', self.path);
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
                if(self._readVersion(fd)){
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
                };
            };

            if(fd){
                fs.closeSync(fd);
            };
            
            callback(err);
        });
    },
    write: function(callback, version){
        if(callback === null){
            throw new Error('callback not defined');
        };
        var self = this;
        
        var filePath = path.parse(self.path).dir;
        var pathArray = filePath.split('/');
        if(pathArray.length <= 1){
            pathArray = filePath.split(path.sep);
        };
        var newPath = '';
        for(let i = 0; i < pathArray.length; i++){
            newPath += pathArray[i] + path.sep;
            if(!fs.existsSync(newPath)){
                fs.mkdirSync(newPath);
            };
        };
       
        fs.open(self.path, 'w', function(err, fd){
            if(err === null){
                // Write the Spectrum Header
                self._writeSpectrumHeader(fd);
                // Write the Spectrum Buffer
                self._writeSpectrumBuffer(fd);
                // Multi vector file
                if(self.asdFileVersion.version >= self.asdFileVersion.fileVersion.version2){
                    // Reference Header
                    self._writeReferenceHeader(fd);
                    // Reference Spectrum
                    self._writeReferenceSpectrum(fd);
                }; 
            };

            if(fd){
                fs.closeSync(fd);
            };
            
            callback(err);
        });
    },
    _readVersion: function(fd){
        var version = this._readFixedString(fd, 3);
        this.asdFileVersion = new asdFileVersion(version);
    
        return this.asdFileVersion.isVersionValid;
    },
    _readSpectrumHeader: function(fd){ 
        // co
        this.spectrumHeader.co = this.asdFileVersion.versionString;
        // comments
        this.spectrumHeader.comments = this._readBytes(fd, 157);
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
        this.spectrumHeader.darkTime = this._readInt32(fd);
        // data_type
        this.spectrumHeader.dataType = this._readInt8(fd);
        // ref time
        this.spectrumHeader.referenceTime = this._readInt32(fd);
        // ch1_wave
        this.spectrumHeader.channel1Wavelength = this._readFloat32(fd);
        // wave_step
        this.spectrumHeader.wavelengthStep = this._readFloat32(fd);
        // data_format
        this.spectrumHeader.dataFormat = this._readInt8(fd);
        // 3 Unused bytes
        this.spectrumHeader.unused1 = this._readBytes(fd, 3);
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
        this.spectrumHeader.yMin = this._readFloat32(fd);
        // ymax
        this.spectrumHeader.yMax = this._readFloat32(fd);
        // xmin
        this.spectrumHeader.xMin = this._readFloat32(fd);
        // xmax
        this.spectrumHeader.xMax = this._readFloat32(fd);
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
        this.spectrumHeader.splice1 = this._readFloat32(fd);
        // splice2_wavelength
        this.spectrumHeader.splice2 = this._readFloat32(fd);
        // 32 bytes not used
        this.spectrumHeader.unused2 = this._readBytes(fd, 32);
    },
    _readSpectrumBuffer: function(fd){
        if(this.asdFileVersion.version > this.asdFileVersion.fileVersion.version1){
            this.spectrumBuffer = this._readFloat64Array(fd, this.spectrumHeader.channels);
        } else {
            this.spectrumBuffer = this._readFloat32Array(fd, this.spectrumHeader.channels);
        }
    },
    _readReferenceHeader: function(fd){
        // Reference Flag
        this.referenceHeader.referenceFlag = this._readBool(fd);
        // ReferenceTime
        this.referenceHeader.referenceTime = this._readFloat64(fd);
        // SpectrumTime
        this.referenceHeader.spectrumTime = this._readFloat64(fd);
        // Reference Description
        this.referenceHeader.referenceDesription = this._readVariableString(fd);
    },
    _readReferenceBuffer: function(fd){
        this.referenceBuffer = this._readFloat64Array(fd, this.spectrumHeader.channels);
    },
    _readBytes: function(fd, size){
        var dataView = this._getDataView(fd, size);
        var buffer = new Buffer(dataView.buffer);
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
    _readFloat32: function(fd){
        var dataView = this._getDataView(fd, 4)
        var value = dataView.getFloat32(0, true);

        return value;
    },
    _readFloat64: function(fd){
        var dataView = this._getDataView(fd, 8)
        var value = dataView.getFloat64(0, true);

        return value;
    },
    _readFloat32Array: function(fd, size){
        var dataView = this._getDataView(fd, size * 4)
        var float32Array = new Float32Array(size);

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
        //console.log(this.spectrumHeader.when.getSaveDateTime());
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
        var dataView = this._initDataView(size);
        var buffer = new Buffer(size);
        fs.readSync(fd, buffer, 0, size, null);

        buffer.forEach(function(value, index){
            dataView.setUint8(index, value);
        });

        return dataView;
    },
    _initDataView: function(size){
        var arrayBuffer = new ArrayBuffer(size);
        var dataView = new DataView(arrayBuffer);
        return dataView;
    },
    _writeSpectrumHeader: function(fd){
        // co
        this._writeFixedString(fd, this.asdFileVersion.versionString, 3);
        // comment
        this._writeFixedString(fd, this.spectrumHeader.comments, 157);
        // when
        this._writeSaveDateTime(fd, this.spectrumHeader.when, 18);
        // program version
        this._writeInt8(fd, this.spectrumHeader.programVersion);
        // file version
        this._writeInt8(fd, this.spectrumHeader.fileVersion);
        // itime
        this._writeInt8(fd, this.spectrumHeader.itime);
        // dc_corr
        this._writeInt8(fd, this.spectrumHeader.darkCorrected);
        // dc_time
        this._writeInt32(fd, this.spectrumHeader.darkTime);
        // data_type
        this._writeInt8(fd, this.spectrumHeader.dataType);
        // ref time
        this._writeInt32(fd, this.spectrumHeader.referenceTime);
        // ch1_wave
        this._writeFloat32(fd, this.spectrumHeader.channel1Wavelength);
        // wave_step
        this._writeFloat32(fd, this.spectrumHeader.wavelengthStep);
        // data_format
        this._writeInt8(fd, this.spectrumHeader.dataFormat);
        // 3 Unused bytes
        this._writeBytes(fd, this.spectrumHeader.unused1, 3);
        // application
        this._writeInt8(fd, this.spectrumHeader.application);
        // channels
        this._writeInt16(fd, this.spectrumHeader.channels);
        // APP_DATA
        this._writeAppData(fd, this.appData);
        // GPS
        this._writeGpsData(fd, this.gpsData);
        // it
        this._writeInt32(fd, this.spectrumHeader.it);
        // fo
        this._writeInt16(fd, this.spectrumHeader.fo);
        // dcc
        this._writeInt16(fd, this.spectrumHeader.dcc);
        // calibration
        this._writeInt16(fd, this.spectrumHeader.calibration);
        // instrument number
        this._writeInt16(fd, this.spectrumHeader.instrumentNum);
        // ymin
        this._writeFloat32(fd, this.spectrumHeader.yMin);
        // ymax
        this._writeFloat32(fd, this.spectrumHeader.yMax);
        // xmin
        this._writeFloat32(fd, this.spectrumHeader.xMin);
        // xmax
        this._writeFloat32(fd, this.spectrumHeader.xMax);
        // ip_numbits
        this._writeInt16(fd, this.spectrumHeader.ipNumBits);
        // xmode
        this._writeInt8(fd, this.spectrumHeader.xMode);
        // flags
        this._writeBytes(fd, this.spectrumHeader.flags, 4);
        // dc_count
        this._writeInt16(fd, this.spectrumHeader.darkCount);
        // ref_count
        this._writeInt16(fd, this.spectrumHeader.referenceCount);
        // sample_count
        this._writeInt16(fd, this.spectrumHeader.sampleCount);
        // instrument
        this._writeInt8(fd, this.spectrumHeader.instrument);
        // bulb
        this._writeInt32(fd, this.spectrumHeader.bulb);
        // swir1_gain
        this._writeInt16(fd, this.spectrumHeader.swir1Gain);
        // swir2_gain
        this._writeInt16(fd, this.spectrumHeader.swir2Gain);
        // swir1_offset
        this._writeInt16(fd, this.spectrumHeader.swir1Offset);
        // swir2_offset
        this._writeInt16(fd, this.spectrumHeader.swir2Offset);
        // splice1_wavelength
        this._writeFloat32(fd, this.spectrumHeader.splice1);
        // splice2_wavelength
        this._writeFloat32(fd, this.spectrumHeader.splice2);
        // 32 bytes not used
        this._writeBytes(fd, this.spectrumHeader.unused2, 32); 
    },
    _writeSpectrumBuffer: function(fd){
        if(this.asdFileVersion.version > this.asdFileVersion.fileVersion.version1){
            this._writeFloat64Array(fd, this.spectrumBuffer, this.spectrumHeader.channels);
        } else {
            this._writeFloat32Array(fd, this.spectrumBuffer, this.spectrumHeader.channels);
        }
    },
    _writeReferenceHeader: function(fd){
        // Reference Flag
        this._writeBool(fd, this.referenceHeader.referenceFlag);
        // ReferenceTime
        this._writeFloat64(fd, this.referenceHeader.referenceTime);
        // SpectrumTime
        this._writeFloat64(fd, this.referenceHeader.spectrumTime);
        // Reference Description
        this._writeVariableString(fd, this.referenceHeader.referenceDesription);
    },
    _writeReferenceSpectrum: function(fd){
        this._writeFloat64Array(fd, this.referenceSpectrum, this.spectrumHeader.channels);
    },
    _writeBytes: function(fd, value, size){
        this._writeFixedString(fd, value, size);
    },
    _writeBool: function(fd, value){
        var dataView = this._initDataView(2);
        dataView.setUint16(0, value, true);
        this._appendToFile(fd, dataView.buffer);
    },
    _writeFixedString: function(fd, value, size){
        var dataView = this._initDataView(size);
        
        if(value != undefined && value.length > 0){
            var buffer = new Buffer(value);
            buffer.forEach(function(value, index){
                if(index < size){
                    dataView.setUint8(index, value);
                };
            });
        };

        this._appendToFile(fd, dataView.buffer);
    },
    _writeVariableString(fd, value){
        var dataView = this._initDataView(2);
        if(value === undefined){
            dataView.setInt16(0, 0);
            this._appendToFile(fd, dataView.buffer);
        } else {
            var size = value.length;
            dataView.setInt16(0, size);
            this._appendToFile(fd, dataView.buffer);
            this._writeFixedString(fd, value, size);
        };
    },
    _writeSaveDateTime: function(fd, value, size){
        var dataView = this._initDataView(size);

        dataView.setInt16(0, this.spectrumHeader.when.seconds, true);     
        dataView.setInt16(2, this.spectrumHeader.when.minute,true);     
        dataView.setInt16(4, this.spectrumHeader.when.hour, true); 
        dataView.setInt16(6, this.spectrumHeader.when.day, true);   
        dataView.setInt16(8, this.spectrumHeader.when.month, true);     
        dataView.setInt16(10, this.spectrumHeader.when.year, true);
        dataView.setInt16(12, this.spectrumHeader.when.weekDay, true);    
        dataView.setInt16(14, this.spectrumHeader.when.daysInYear, true);  
        dataView.setInt16(16, this.spectrumHeader.when.isDaylighSavings, true);

        this._appendToFile(fd, dataView.buffer);
    },
    _writeOADateTime: function(fd, value){
        var dataView = this._initDataView(8);
        var epoch = new Date(Date.UTC(1899, 11, 30, 0, 0, 0, 0));
        var msPerDay = 86400000;
        var value = -1 * (epoch - date)/msPerDay;
        dataView.setFloat64(0, value, true);
        var buffer = new Buffer(arrayBuffer);
        fs.appendFileSync(fd, buffer, 0, buffer.length);
    },
    _writeInt8: function(fd, value){
        var dataView = this._initDataView(1);
        dataView.setUint8(0, value);
        this._appendToFile(fd, dataView.buffer);
    },
    _writeInt16: function(fd, value){
        var dataView = this._initDataView(2);
        dataView.setInt16(0, value, true);
        this._appendToFile(fd, dataView.buffer);
    },
    _writeInt32: function(fd, value){
        var dataView = this._initDataView(4);
        dataView.setInt32(0, value, true);
        this._appendToFile(fd, dataView.buffer);
    },
    _writeFloat32: function(fd, value){
        var dataView = this._initDataView(4);
        dataView.setFloat32(0, value, true);
        this._appendToFile(fd, dataView.buffer);
    },
    _writeFloat64: function(fd, value){
        var dataView = this._initDataView(8);
        dataView.setFloat64(0, value, true);
        this._appendToFile(fd, dataView.buffer);
    },
    _writeFloat32Array: function(fd, value, size){
        if(value != undefined && size > 0){
            var dataView = this._initDataView(size * 4)
            for(var i = 0; i < size; i++){
                dataView.setFloat32(i * 4, value[i], true);
            };
            this._appendToFile(fd, dataView.buffer);
        };
    },
    _writeFloat64Array: function(fd, value, size){
        if(value != undefined && size > 0){
            var dataView = this._initDataView(size * 8)
            for(var i = 0; i < size; i++){
                dataView.setFloat64(i * 8, value[i], true);
            };
            this._appendToFile(fd, dataView.buffer);
        };
    },
    _writeAppData: function(fd, value){
        var dataView = this._initDataView(128);

        if(value != undefined && value.length > 0){
            var buffer = new Buffer(value);
            buffer.forEach(function(value, index){
                if(index < size){
                    dataView.setUint8(index, value);
                };
            });
        };

        this._appendToFile(fd, dataView.buffer);
    },
    _writeGpsData: function(fd, value){
        var dataView = this._initDataView(56);

        dataView.setFloat64(0, this.spectrumHeader.gpsData.true_heading, true);
        dataView.setFloat64(8, this.spectrumHeader.gpsData.speed, true);
        dataView.setFloat64(16, this.spectrumHeader.gpsData.latitude, true);
        dataView.setFloat64(24, this.spectrumHeader.gpsData.longitude, true);
        dataView.setFloat64(32, this.spectrumHeader.gpsData.altitude, true);
        dataView.setInt16(40, this.spectrumHeader.gpsData.lock, true);
        dataView.setInt8(42, this.spectrumHeader.gpsData.hardware_mode);
        dataView.setInt8(43, this.spectrumHeader.gpsData.ss);
        dataView.setInt8(44, this.spectrumHeader.gpsData.mm);
        dataView.setInt8(45, this.spectrumHeader.gpsData.hh);
        dataView.setInt8(46, this.spectrumHeader.gpsData.flags1);
        dataView.setInt16(47, this.spectrumHeader.gpsData.flags2, true);
        dataView.setInt8(49, this.spectrumHeader.gpsData.satellites);
        dataView.setInt8(50, this.spectrumHeader.gpsData.satellites);
        dataView.setInt8(51, this.spectrumHeader.gpsData.satellites);
        dataView.setInt8(52, this.spectrumHeader.gpsData.satellites);
        dataView.setInt8(53, this.spectrumHeader.gpsData.satellites);
        dataView.setInt8(54, this.spectrumHeader.gpsData.filler);
        dataView.setInt8(55, this.spectrumHeader.gpsData.filler);

        this._appendToFile(fd, dataView.buffer);
    },
    _appendToFile(fd, arrayBuffer){
        if(arrayBuffer != undefined){
            var buffer = new Buffer(arrayBuffer);
            fs.appendFileSync(fd, buffer, 0, buffer.length);
        };
    }
};
