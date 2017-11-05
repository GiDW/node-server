'use strict';

var fs = require('fs');
var path = require('path');

var File = require('./file');

function Files () {}

/**
 * @constructor
 * @param {string} urlPath
 * @param {function} callback
 */
Files.prototype.get = function get(urlPath,
    callback) {

    var fsPath;

    fsPath = path.join('.', urlPath);

    fs.readFile(fsPath, onRead);

    function onRead (err, data) {

        if (err) return callback(err);

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
