'use strict';

var path = require('path');

var types = require('./file-content-types');

/**
 * @constructor
 * @param {object} [options]
 */
function File (options) {

    this.extension = '';
    this.contentType = '';
    this.data = '';

    if (options) {

        if (options.data) this.data = options.data;
        if (options.path) this._parsePath(options.path);
        if (options.extension) this.extension = options.extension;
        if (options.contentType) this.contentType = options.contentType;
    }
}

/**
 * @param {string} filePath
 * @returns {object}
 */
File.parseFilePath = function parseFilePath (filePath) {

    var result = {};

    result.extension = path.extname(filePath);

    if (result.extension) {

        result.extension = result.extension.substr(
            1,
            result.extension.length - 1
        );

        if (result.extension) {

            result.contentType = types[this.extension];
        }
    }

    return result;
};

/**
 * @private
 * @param {string} urlPath
 */
File.prototype._parsePath = function parsePath (urlPath) {

    var parsed = File.parseFilePath(urlPath);

    if (parsed.extension) this.extension = parsed.extension;
    if (parsed.contentType) this.contentType = parsed.contentType;
};

module.exports = File;
