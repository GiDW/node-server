#!/usr/bin/env node

'use strict'

var Server = require('./lib/server')

new Server(processArgs()).start()

function processArgs () {
  var i, length, arg, options

  options = {}

  length = process.argv.length
  for (i = 0; i < length; i++) {
    arg = process.argv[i]

    if (arg.indexOf('--port=') === 0) {
      options.port = parseInt(arg.substring(7), 10)
    } else if (arg.indexOf('-p=') === 0) {
      options.port = parseInt(arg.substring(3), 10)
    } else if (arg.indexOf('--cors=') === 0) {
      options.cors = arg.substring(7)
    } else if (arg.indexOf('-c=') === 0) {
      options.cors = arg.substring(3)
    } else if (arg.indexOf('--logRequest') === 0) {
      if (arg === '--logRequest' ||
        arg === '--logRequest=true' ||
        arg === '--logRequest=1') {
        options.logRequest = true
      } else if (arg === '--logRequest=false' ||
        arg === '--logRequest=0') {
        options.logRequest = false
      } else if (arg === '--logRequestHeaders' ||
        arg === '--logRequestHeaders=true' ||
        arg === '--logRequestHeaders=1') {
        options.logRequestHeaders = true
      } else if (arg === '--logRequestHeaders=false' ||
        arg === '--logRequestHeaders=0') {
        options.logRequestHeaders = false
      } else if (arg === '--logRequestAddress' ||
        arg === '--logRequestAddress=true' ||
        arg === '--logRequestAddress=1') {
        options.logRequestAddress = true
      } else if (arg === '--logRequestAddress=false' ||
        arg === '--logRequestAddress=0') {
        options.logRequestAddress = false
      }
    } else if (arg.indexOf('-l' === 0)) {
      if (arg === '-lr' ||
        arg === '-lR' ||
        arg === '-lr=true' ||
        arg === '-lR=true' ||
        arg === '-lr=1' ||
        arg === '-lR=1') {
        options.logRequest = true
      } else if (arg === '-lr=false' ||
        arg === '-lR=false' ||
        arg === '-lr=0' ||
        arg === '-lR=0') {
        options.logRequest = false
      } else if (arg === '-lrh' ||
        arg === '-lRH' ||
        arg === '-lrh=true' ||
        arg === '-lRH=true' ||
        arg === '-lrh=1' ||
        arg === '-lRH=1') {
        options.logRequestHeaders = true
      } else if (arg === '-lrh=false' ||
        arg === '-lRH=false' ||
        arg === '-lrh=0' ||
        arg === '-lRH=0') {
        options.logRequestHeaders = false
      } else if (arg === '-lra' ||
        arg === '-lRA' ||
        arg === '-lra=true' ||
        arg === '-lRA=true' ||
        arg === '-lra=1' ||
        arg === '-lRA=1') {
        options.logRequestAddress = true
      } else if (arg === '-lra=false' ||
        arg === '-lRA=false' ||
        arg === '-lra=0' ||
        arg === '-lRA=0') {
        options.logRequestAddress = false
      }
    } else if (arg.indexOf('--rootLookForIndex') === 0) {
      if (arg === '--rootLookForIndex' ||
        arg === '--rootLookForIndex=true' ||
        arg === '--rootLookForIndex=1') {
        options.rootLookForIndex = true
      } else if (arg === '--rootLookForIndex=false' ||
        arg === '--rootLookForIndex=0') {
        options.rootLookForIndex = false
      }
    }
  }

  return options
}
