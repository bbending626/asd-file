'use strict'

function define(name, value){
    Object.defineProperty(exports, name, {
        value : value,
        enumerable : true
    });
}

define('VERSION_NOT_VALID', 'Invalid');
define('VERSION_1', 'ASD');
define('VERSION_2', 'as2');
define('VERSION_7', 'as7');
