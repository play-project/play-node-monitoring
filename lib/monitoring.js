/*!
 * PLAY live monitoring
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */
 
var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , api = require('./api/v1')
  , push = require('./push')
  , stats = require('./stats')
  , store = require('./store')
  , path = require('path')
  , http = require('http')
  , io = require('socket.io')
  , express = require('express')
  , app = express();

var Monitoring = function Monitoring(config) {
  EventEmitter.call(this);
  this._config = config;
}

util.inherits(Monitoring, EventEmitter);

Monitoring.prototype.start = function start(callback) {
  var self = this;
  util.log("Starting the monitoring engine...");
  
  // start express and socket.io
  // TODO : Create a class for that
  app.configure(function() {
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
  
  var server = http.createServer(app);
  io = io.listen(server);

  var Push = require('./push').Push;
  var push = new Push(io, 10000);
  push.start(function() {
    util.log('Push started');
  });

  server.listen(app.get('port'), function () {
      util.log("Monitoring server listening on port " + app.get('port'));
      stats.started();
  });
  
  var V1 = require('./api/v1').V1;
  var api = new V1(app);
  api.start(function() {
    util.log('API Started')
  });
  
  api.on('dsb_wsn_notify', function(notify) {
    push.push_notify(notify, function() {
    });
    stats.update_notify(notify);
  });
  
  api.on('dsb_wsn_error', function(notify) {
    push.push_error(notify, function() {
    });
    stats.update_error(notify);
  });
  
  api.on('fps', function(json) {
    push.push_fps(json, 'business', function() {});
  });
  
  callback();
}

Monitoring.prototype.stop = function stop(callback) {

}

exports.Monitoring = Monitoring;