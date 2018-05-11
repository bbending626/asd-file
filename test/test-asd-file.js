'use strict'

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert;
var asdFile = require('../src/asd-file');
var spectrum = require('../src/spectrum');
var asdFileVersion = require('../src/asd-file-version');
var constants = require('../src/constants');

var spectrum = new spectrum();
var file = new asdFile('./test/support/files/DN00001.asd', spectrum); 

describe('#asdFile', function(){
    it('exists should have callback', function(){
        expect(function(){
            file.exists(null);
        }).to.throw('callback not defined');
    });

    it('file should exist', function(){
        file.exists(function(err, exists){
            expect(exists).to.equal(true);
        });
    });

    it('should have a swir1 gain = 107', function(){
        var file = new asdFile('./test/support/files/reflectance00000.asd', spectrum);
        file.read(function(err){
            if(err != null){
                expect(file.spectrumHeader.swir1_gain).to.equal(107);
            }
        });
    });

    it('should have a reference header', function(){
        var file = new asdFile('./test/support/files/reflectance00000.asd', spectrum);
        file.read(function(err){
            //
        });
    });

    it('read should have callback', function(){
        expect(function(){
            file.read(null);
        }).to.throw('callback not defined');
    });

    it('should return ENOENT when file does not exist', function(){
        var file = new asdFile('./test/support/files/DN00002.asd', null);
        file.read(function(err){
            expect(err.code).to.equal('ENOENT'); 
        }); 
    });

    it('should open and read', function(){
        file.read(function(err){
            expect(err).to.is.null;
        });
    });

    it('should be version7', function(){
        file.read(function(err){
            expect(file.asdFileVersion.version).to.equal(7);
            expect(file.asdFileVersion.versionString).to.equal(constants.VERSION_7);
        });
    });

    it('should NOT be version1', function(){
        file.read(function(err){
            expect(file.asdFileVersion.version).to.not.equal(1);
        });
    });

    it('should return rawDN for comments', function(){
        file.read(function(err){
            expect(file.spectrumHeader.comments).to.equal('rawDN');
        });
    });

});