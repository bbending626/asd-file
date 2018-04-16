'use strict'

var fs = require('fs');

const asdFile = module.exports = function(path, context){
    this.path = path;
    this.context = context;
};

asdFile.prototype.exists = function(cb){
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
};

asdFile.prototype.read = function(cb){
    var self = this;
    fs.open(self.path, 'r', function(err, fd){
        var result = '';
        if(err === null){
            console.log('%s file opened', self.path);
            var buffer = new Buffer(484);
            var num = fs.readSync(fd, buffer, 0, 484, null);
            console.log('bytes read %d', num);
            buffer = new Buffer(2151);
            num = fs.readSync(fd, buffer, 0, 2151, null);
            console.log('bytes read %d', num);
        }

        if(fd){
            fs.close(fd);
        }
    });
};
