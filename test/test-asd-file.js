'use strict'

var expect = require('chai').expect;
const asdFile = require('../asd-file');
const file = new asdFile('./test/support/files/DN00001.asd', null); 

describe('#asdFile', function(){
    it('file should exist', function(){
        file.exists(function(err, exists){
            expect(exists).to.equal(true);
        });
    });

    it('should open and read', function(){
        file.read(function(err){
            expect(err).to.is.null;
        });
    });
});