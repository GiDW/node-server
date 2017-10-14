'use strict';

function EndPoint (options) {

    this._path = '/';
    this._method = 'GET';
    this._handler = function () {};

    if (options) {

        if (options.path) this._path = options.path;
        if (options.method) this._method = options.method;
        if (options.handler) this._handler = options.handler;
    }
}

module.exports = EndPoint;
