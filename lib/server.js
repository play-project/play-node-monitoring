/*!
 * PLAY live monitoring
 *
 * The express.js server
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var express = require('express')
  , path = require('path')
  , http = require('http')
  , util = require('util')
  , io = require('socket.io')
  , app = express();

var server = null;
exports.app = app;

/**
 * Starts the express server
 *
 * @param cb(error)
 */
exports.start = function(cb) {

  app.configure(function() {
    // TODO : Use config
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname, '../public')));
  });

  app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function() {
    app.use(express.errorHandler());
  });
  server = http.createServer(app);

  io = io.listen(server);
  exports.io = io;

  server.listen(app.get('port'), function () {
    util.log("HTTP server listening on port " + app.get('port'));
    io.sockets.on('connection', function(socket) {
      console.log('Got a socket.io connection')
    });
  });

  if (cb) {
    cb();
  }
}

/**
 * Stops the server
 *
 * @param cb(error)
 */
exports.stop = function(cb) {

}