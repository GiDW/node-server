'use strict';

var http = require('http');

var File = require('./file');
var Files = require('./files');

/**
 * @constructor
 * @param {object} [options]
 */
function Server (options) {

    this._server = null;

    this._port = 8080;

    this._files = new Files();

    this._index = new File({
        contentType: 'text/plain',
        data: 'No index.html found!'
    });

    this._endpoints = [];

    if (options) {

        if (options.port) this._port = options.port;

    }

    if (!this._server) {

        this._server = http.createServer(
            this._handler.bind(this)
        );
    }

    this._files.get(
        'index.html',
        this._onIndex.bind(this)
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
 * @param {object} request
 */
Server.prototype._printRequest = function (request) {

    if (request) {

        console.info(
            '\x1b[31m' + request.method + '\x1b[0m' +
            ' \x1b[34m' + request.httpVersion + '\x1b[0m' +
            ' ' + request.url
        );
    }
};

/**
 * @private
 * @param {object} request
 * @param {object} response
 */
Server.prototype._handleRoot = function (request, response) {

    response.writeHead(
        200,
        {
            'Content-Type': this._index.contentType
        }
    );
    response.end(this._index.data);
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
 */
Server.prototype._handleDefault = function (request, response) {

    var self = this;

    this._files.get(
        request.url,
        onFiles
    );

    function onFiles (err, data) {

        if (err) return self._handleNotFound(request, response);

        response.writeHead(
            200,
            {
                'Content-Type': data.contentType
            }
        );
        response.end(data.data);
    }
};

/**
 * @private
 * @param {*} err
 * @param {?File} data
 */
Server.prototype._onIndex = function (err, data) {

    if (!err) {

        this._index = data;
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

    this._printRequest(request);

    if (urlPath === '/') {

        this._handleRoot(request, response);

    } else {

        this._handleDefault(request, response);
    }
};

module.exports = Server;
