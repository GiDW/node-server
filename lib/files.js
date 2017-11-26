'use strict';

var fs = require('fs');
var path = require('path');

var File = require('./file');

/**
 * @constructor
 */
function Files () {}

/**
 * @param {string} urlPath
 * @returns {string}
 */
Files.prototype.getPath = function getPath (urlPath) {

    return path.join('.', urlPath);
};

/**
 * @param {string} urlPath
 * @param {function} callback
 */
Files.prototype.get = function get (urlPath, callback) {

    var fsPath = this.getPath(urlPath);

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
