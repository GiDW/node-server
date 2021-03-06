'use strict'

var os = require('os')
var http = require('http')
var url = require('url')
var fs = require('fs')
var path = require('path')

var types = require('./file-content-types')

var majorNodeVersion = getMajorNodeVersion()

/**
 * @constructor
 * @param {object} [options]
 */
function Server (options) {
  this._port = 8080
  this._cors = null
  this._directory = '.'
  this._indexUrl = {
    pathname: '/index.html'
  }
  this._rootLookForIndex = true
  this._logRequest = true
  this._logRequestHeaders = false
  this._logRequestAddress = true

  if (options) {
    if (typeof options.port === 'number' &&
      isFinite(options.port)) {
      this._port = options.port
    }

    if (typeof options.rootLookForIndex === 'boolean') {
      this._rootLookForIndex = options.rootLookForIndex
    }

    if (typeof options.cors === 'string' && options.cors) {
      this._cors = options.cors
    }

    if (typeof options.directory === 'string' && options.directory) {
      this._directory = options.directory
    }

    if (typeof options.logRequest === 'boolean') {
      this._logRequest = options.logRequest
    }

    if (typeof options.logRequestHeaders === 'boolean') {
      this._logRequestHeaders = options.logRequestHeaders
    }

    if (typeof options.logRequestAddress === 'boolean') {
      this._logRequestAddress = options.logRequestAddress
    }
  }

  this._directory = Server._resolvePath(this._directory)

  this._server = http.createServer(
    this._handler.bind(this)
  )

  this._handleError = this._onError.bind(this)

  this._server.on('error', this._handleError)
}

/**
 * Starts the server
 *
 * @public
 */
Server.prototype.start = function start () {
  this._server.listen(this._port)
  console.info('http://localhost' + (this._port === 80 ? '' : ':' + this._port))
}

/**
 * Stops the server
 *
 * @public
 */
Server.prototype.stop = function stop () {
  this._server.close()
}

/**
 * @private
 * @constant {string}
 */
Server._CONTENT_TYPE = 'Content-Type'

/**
 * @private
 * @constant {string}
 */
Server._ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin'

/**
 * @private
 * @param {string} path
 * @returns {string}
 */
Server._resolvePath = function (path) {
  var char
  if (path.charAt(0) === '~') {
    char = path.charAt(1)
    if (char === '$' || char === '/' || char === '\\') {
      return os.homedir() + path.substring(1)
    }
  }
  return path
}

/**
 * @private
 * @param {object} request
 */
Server.prototype._printRequest = function (request) {
  var str, headers, key, keys, i, length

  if (request) {
    str =
      '\x1b[32m' + request.method + '\x1b[0m' +
      ' ' + '\x1b[34m' + request.httpVersion + '\x1b[0m'

    if (this._logRequestAddress) {
      str += ' ' + '\x1b[33m' + request.connection.remoteAddress + '\x1b[0m'
    }

    str += ' ' + request.url

    if (this._logRequestHeaders) {
      headers = request.headers
      keys = Object.keys(headers)
      length = keys.length

      if (length > 0) str += '\n'

      for (i = 0; i < length; i++) {
        key = keys[i]

        str += '\x1b[38;5;102m' +
          keys[i] + ':\x1b[0m ' +
          headers[key] + '\n'
      }
    }

    console.info(str)
  }
}

/**
 * @private
 * @param {*} error
 */
Server.prototype._printError = function (error) {
  console.error('\x1b[31m', error, '\x1b[0m')
}

/**
 * @private
 */
Server.prototype._onError = function (error) {
  if (error.code === 'EADDRINUSE') {
    console.warn('Address in use')
  } else {
    console.error('ERROR', error)
  }
}

/**
 * @private
 * @param {string} urlPath
 * @returns {string}
 */
Server.prototype._getPath = function (urlPath) {
  return path.join(this._directory, urlPath)
}

/**
 * @param {string} filePath
 * @returns {object}
 */
Server.prototype._parseFilePath = function (filePath) {
  var result = {}

  result.extension = path.extname(filePath)

  if (result.extension) {
    result.extension = result.extension.substr(
      1,
      result.extension.length - 1
    )

    if (result.extension) {
      result.extension = result.extension.toLowerCase()
      result.contentType = types[result.extension]
    }
  }

  return result
}

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
      'Content-Type': types.T_TXT
    }
  )
  response.end('NOT FOUND!')
}

/**
 * @private
 * @param {object} request
 * @param {object} response
 * @param {URL} requestUrl
 */
Server.prototype._handleStream = function (request, response, requestUrl) {
  var _this = this

  var fsPath
  var readStream, isReading

  fsPath = this._getPath(requestUrl.pathname)

  readStream = fs.createReadStream(fsPath)

  isReading = false

  readStream.on('error', onError)
  readStream.on('open', onOpen)

  function onOpen () {
    var headers, fileInfo
    var contentType = types.DEFAULT

    if (!isReading) {
      isReading = true

      fileInfo = _this._parseFilePath(fsPath)

      if (fileInfo.contentType) contentType = fileInfo.contentType

      headers = {}
      headers[Server._CONTENT_TYPE] = contentType
      if (_this._cors) {
        headers[Server._ACCESS_CONTROL_ALLOW_ORIGIN] = _this._cors
      }

      response.writeHead(200, headers)
      readStream.pipe(response)
    }
  }

  function onError (error) {
    if (isReading) {
      _this._printError(error)
      response.end('An error occured')
    } else {
      _this._handleNotFound(request, response)
    }
  }
}

/**
 * @private
 * @param {object} request
 * @param {object} response
 */
Server.prototype._handler = function (request, response) {
  var parsedUrl

  if (majorNodeVersion > 10) {
    parsedUrl = new URL(request.url, 'http://localhost')
  } else {
    // eslint-disable-next-line node/no-deprecated-api
    parsedUrl = url.parse(request.url)
  }

  if (this._logRequest) this._printRequest(request)

  if (this._rootLookForIndex && parsedUrl.pathname === '/') {
    this._handleStream(request, response, this._indexUrl)
  } else {
    this._handleStream(request, response, parsedUrl)
  }
}

function getMajorNodeVersion () {
  var nodeVersions, nodeVersion, split, major

  nodeVersions = process.versions
  nodeVersion = nodeVersions.node

  if (nodeVersion) {
    split = nodeVersion.split('.')
    if (Array.isArray(split) && split[0]) {
      major = parseInt(split[0], 10)
      if (!isNaN(major)) return major
    }
  }

  return -1
}

module.exports = Server
