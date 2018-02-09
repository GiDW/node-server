#!/usr/bin/env node

'use strict';

var Server = require('./lib/libserver');

var srv = new Server();

srv.start();
