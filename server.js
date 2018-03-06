#!/usr/bin/env node

'use strict';

var Server = require('./lib/server');

var srv = new Server(processArgs());

srv.start();

function processArgs () {

    var i, length, arg, options;

    options = {};

    length = process.argv.length;
    for (i = 0; i < length; i++) {

        arg = process.argv[i];

        if (arg.indexOf('-port=') === 0) {

            options.port = parseInt(arg.substring(6), 10);

        } else if (arg.indexOf('-cors=') === 0) {

            options.cors = arg.substring(6);

        } else if (arg.indexOf('-logRequest') === 0) {

            if (arg === '-logRequest' ||
                arg === '-logRequest=true' ||
                arg === '-logRequest=1') {

                options.logRequest = true;

            } else if (arg === '-logRequest=false' ||
                arg === '-logRequest=0') {

                options.logRequest = false;

            } else if (arg === '-logRequestHeaders' ||
                arg === '-logRequestHeaders=true' ||
                arg === '-logRequestHeaders=1') {

                options.logRequestHeaders = true;

            } else if (arg === '-logRequestHeaders=false' ||
                arg === '-logRequestHeaders=0') {

                options.logRequestHeaders - false;
            }
        }
    }

    return options;
}
