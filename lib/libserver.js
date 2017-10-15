'use strict';

var http = require('http');
var path = require('path');

var File = require('./file');
var Files = require('./files');

var types = require('./file-content-types');

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

        this._server = http.createServer(Server.handler.bind(null, this));
    }

    this._files.get(
        'index.html',
        Server.onIndex.bind(null, this)
    );
}

Server.prototype.start = function start () {

    this._server.listen(this._port);
};

Server.prototype.stop = function stop () {

    this._server.close();
};

Server.prototype.printRequest = function (request) {

    if (request) {

        console.info(
            '\x1b[31m' + request.method + '\x1b[0m' + 
            ' \x1b[34m' + request.httpVersion + '\x1b[0m' + 
            ' ' + request.url
        );
    }
};

Server.prototype.handleRoot = function handleRoot (request, response) {

    response.writeHead(
        200,
        {
            'Content-Type': this._index.contentType
        }
    );
    response.end(this._index.data);
}

Server.prototype.handleNotFound = function (request, response) {

    response.writeHead(
        404,
        'NOT FOUND',
        {
            'Content-Type': 'text/plain'
        }
    );
    response.end('NOT FOUND!');
};

Server.prototype.handleDefault = function (request, response) {

    var self = this;

    this._files.get(
        request.url,
        onFiles
    );

    function onFiles (err, data) {

        if (err) return self.handleNotFound(request, response);

        response.writeHead(
            200,
            {
                'Content-Type': data.contentType
            }
        );
        response.end(data.data);
    }
};

Server.onIndex = function (server, err, data) {

    if (!err) {

        server._index = data;
    } 
};

Server.handler = function handler(server, request, response) {

    var urlPath;

    urlPath = request.url;

    server.printRequest(request);

    if (urlPath === '/') {

        server.handleRoot(request, response);

    } else {

        server.handleDefault(request, response);
    }
};

module.exports = Server;