
'use strict'

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert;
var asdFile = require('../src/asd-file');
var spectrum = require('../src/spectrum');
var asdFileVersion = require('../src/asd-file-version');
var constants = require('../src/constants');
var utility = require('../src/utility');

var utility = new utility();
var spectrum = new spectrum();
var file = new asdFile('./test/support/files/DN00001.asd', spectrum); 

describe('#asdFile.exist', function(){
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
});

describe('#asdFile.read', function(){
    it('read should have callback', function(){
        expect(function(){
            file.read(null);
        }).to.throw('callback not defined');
    });

    it('should open and read', function(){
        file.read(function(err){
            expect(err).to.is.null;
        });
    });

    it('should return ENOENT when file does not exist', function(){
        var file = new asdFile('./test/support/files/DN00002.asd', null);
        file.read(function(err){
            expect(err.code).to.equal('ENOENT'); 
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
            var actualStr = utility.arrayToString(file.spectrumHeader.comments);
            expect(actualStr).to.equal('rawDN');
        });
    });

});

describe('#asdFile.write', function(){
    it('should have a callback', function(){
        var file = new asdFile('./test/support/files/temp/testwrite.asd', null);
        expect(function(){
            file.write(null);
        }).to.throw('callback not defined');
    });
    
    it('should create file', function(){
        var file = new asdFile('.\\test\\support\\files\\temp\\testwrite.asd', 
                               asdFileVersion.prototype.fileVersion.version7, null);

        file.write(function(err){
            expect(err).to.is.null;
        });
    });
    
    it('should write ASD version', function(){
        var thisFile = new asdFile('.\\test\\support\\files\\temp\\testwrite.asd', 
                               asdFileVersion.prototype.fileVersion.version1, null);
        thisFile.write(function(err){
            expect(thisFile.spectrumHeader.co).to.equal(constants.VERSION_1);
        });
    });

    it('should write comment', function(done){
        var writeFile = new asdFile('.\\test\\support\\files\\temp\\testwrite.asd', 
                               asdFileVersion.prototype.fileVersion.version7, null);
        var expectedComment = 'this is the expected comment';
        writeFile.spectrumHeader.comments = expectedComment;
        writeFile.write(function(err){
            expect(err).is.null;
            expect(writeFile.spectrumHeader.comments).to.equal(expectedComment);

            var readFile = new asdFile('.\\test\\support\\files\\temp\\testwrite.asd', 
                                       null, null);
            readFile.read(function(err){
                expect(err).is.null;
                expect(readFile.spectrumHeader.co).to.equal(writeFile.spectrumHeader.co);
                var actualStr = utility.arrayToString(readFile.spectrumHeader.comments);
                expect(actualStr).to.equal(writeFile.spectrumHeader.comments);
                done();
            });
        });
    });

    it('should write same file contents read', function(done){
        var readFile = new asdFile('.\\test\\support\\files\\DN00001.asd', 
                                       null, null);
        
        readFile.read(function(err){
            expect(err).is.null;

            var writeFile = new asdFile('.\\test\\support\\files\\temp\\testwrite.asd', 
                                        readFile.asdFileVersion.version, null);
            // add values
            writeFile.spectrumHeader = readFile.spectrumHeader;
            writeFile.spectrumBuffer = readFile.spectrumBuffer;
            writeFile.referenceHeader = readFile.referenceHeader;
            writeFile.referenceBuffer = readFile.referenceBuffer;

            writeFile.write(function(err){
                expect(err).is.null;
                var readExpectedFile = new asdFile('.\\test\\support\\files\\temp\\testwrite.asd', 
                                                   null, null);
                readExpectedFile.read(function(err){
                    expect(err).is.null;
                    expect(readExpectedFile.spectrumHeader.co).to.equal(writeFile.spectrumHeader.co);
                    //expect(readExpectedFile.spectrumHeader.comments).is.equal(writeFile.spectrumHeader.comments);
                    expect(readExpectedFile.spectrumBuffer).is.not.null;
                    expect(readExpectedFile.spectrumBuffer.length).is.equal(writeFile.spectrumHeader.channels);
                    done();
                });
            });
        });
    });
});