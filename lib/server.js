'use strict';

var http = require('http');
var fs = require('fs');
var path = require('path');

var types = require('./file-content-types');

/**
 * @constructor
 * @param {object} [options]
 */
function Server (options) {

    this._port = 8080;

    this._rootLookForIndex = true;

    this._cors = null;

    this._logRequest = true;
    this._logRequestHeaders = false;

    if (options) {

        if (typeof options.port === 'number' &&
            isFinite(options.port)) {

            this._port = options.port;
        }

        if (typeof options.rootLookForIndex === 'boolean') {

            this._rootLookForIndex = options.rootLookForIndex;
        }

        if (typeof options.cors === 'string' && options.cors) {

            this._cors = options.cors;
        }

        if (typeof options.logRequest === 'boolean') {

            this._logRequest = options.logRequest;
        }

        if (typeof options.logRequestHeaders === 'boolean') {

            this._logRequestHeaders = options.logRequestHeaders;
        }
    }

    this._server = http.createServer(
        this._handler.bind(this)
    );
}

/**
 * Starts the server
 *
 * @public
 */
Server.prototype.start = function start () {

    this._server.listen(this._port);
};

/**
 * Stops the server
 *
 * @public
 */
Server.prototype.stop = function stop () {

    this._server.close();
};

/**
 * @private
 * @constant {string}
 */
Server._CONTENT_TYPE = 'Content-Type';

/**
 * @private
 * @constant {string}
 */
Server._ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin';

/**
 * @private
 * @param {object} request
 */
Server.prototype._printRequest = function (request) {

    var str, headers, key, keys, i, length;

    if (request) {

        str = '\x1b[32m' + request.method + '\x1b[0m' +
        ' \x1b[34m' + request.httpVersion + '\x1b[0m' +
        ' ' + request.url;

        if (this._logRequestHeaders) {

            headers = request.headers;
            keys = Object.keys(headers);
            length = keys.length;

            if (length > 0) str += '\n';

            for (i = 0; i < length; i++) {

                key = keys[i];

                str += '\x1b[38;5;102m' +
                keys[i] + ':\x1b[0m ' +
                headers[key] + '\n';
            }
        }

        console.info(str);
    }
};

/**
 * @private
 * @param {*} error
 */
Server.prototype._printError = function (error) {

    console.error('\x1b[31m', error, '\x1b[0m');
};

/**
 * @private
 * @param {string} urlPath
 * @returns {string}
 */
Server.prototype._getPath = function (urlPath) {

    return path.join('.', urlPath);
};

/**
 * @param {string} filePath
 * @returns {object}
 */
Server.prototype._parseFilePath = function (filePath) {

    var result = {};

    result.extension = path.extname(filePath);

    if (result.extension) {

        result.extension = result.extension.substr(
            1,
            result.extension.length - 1
        );

        if (result.extension) {

            result.extension = result.extension.toLowerCase();
            result.contentType = types[result.extension];
        }
    }

    return result;
};

/**
 * @private
 * @param {object} request
 * @param {object} response
 */
Server.prototype._handleNotFound = function (request, response) {

    response.writeHead(
        404,
        'NOT FOUND',
        {
            'Content-Type': 'text/plain'
        }
    );
    response.end('NOT FOUND!');
};

/**
 * @private
 * @param {object} request
 * @param {object} response
 * @param {string} [overridePath]
 */
Server.prototype._handleStream = function (request, response, overridePath) {

    var self = this;

    var requestPath, fsPath, fileInfo;
    var readStream, isReading;

    var contentType = types.DEFAULT;

    var headers;

    requestPath = overridePath
        ? overridePath
        : request.url;

    fsPath = this._getPath(requestPath);
    fileInfo = this._parseFilePath(fsPath);

    readStream = fs.createReadStream(fsPath);

    isReading = false;

    if (fileInfo.contentType) contentType = fileInfo.contentType;

    readStream.on(
        'error',
        onError
    );

    readStream.on(
        'readable',
        onReadable
    );

    function onReadable () {

        if (!isReading) {

            isReading = true;

            headers = {};
            headers[Server._CONTENT_TYPE] = contentType;

            if (self._cors) {

                headers[Server._ACCESS_CONTROL_ALLOW_ORIGIN] = self._cors;
            }

            response.writeHead(
                200,
                headers
            );

            readStream.pipe(response);
        }
    }

    function onError (error) {

        if (isReading) {

            self._printError(error);

            request.end('An error occured');

        } else {

            self._handleNotFound(request, response);
        }
    }
};

/**
 * @private
 * @param {object} request
 * @param {object} response
 */
Server.prototype._handler = function (request, response) {

    var urlPath;

    urlPath = request.url;

    if (this._logRequest) this._printRequest(request);

    if (this._rootLookForIndex && urlPath === '/') {

        this._handleStream(request, response, '/index.html');

    } else {

        this._handleStream(request, response);
    }
};

module.exports = Server;