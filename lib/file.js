'use strict';

var path = require('path');

var types = require('./file-content-types');

function File (options) {

    this.extension = '';
    this.contentType = '';
    this.data = '';

    if (options) {

        if (options.data) this.data = options.data;
        if (options.path) this.parsePath(options.path);
        if (options.extension) this.extension = options.extension;
        if (options.contentType) this.contentType = options.contentType;
    }
}

File.prototype.parsePath = function parsePath (urlPath) {

    var extension;

    extension = path.extname(urlPath);

    if (extension) {

        extension = extension.substr(1, extension.length - 1);

        if (extension) {

            this.extension = extension;
            this.contentType = types[this.extension];
        }
    }
};

module.exports = File;