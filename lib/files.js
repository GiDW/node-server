'use strict';

var fs = require('fs');
var path = require('path');

var File = require('./file');
var types = require('./file-content-types');

function Files () {}

Files.prototype.get = function get(urlPath,
    callback) {

    var fsPath;

    fsPath = path.join('.', urlPath);

    fs.readFile(fsPath, onRead);

    function onRead (err, data) {

        var file;

        if (err) return callback(err);

        file = new File();

        callback(
            err, 
            new File({
                path: fsPath,
                data: data
            })
        );
    } 
};

module.exports = Files;
