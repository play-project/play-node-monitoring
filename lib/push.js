/*!
 * PLAY live monitoring
 * Push data to clients using socket.io
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */
 
var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , stats = require('./stats');

var Push = function Push(io, interval) {
  EventEmitter.call(this);
  this.io = io;
  this.interval = interval || 10000;
  
  this.io.sockets.on('connection', function(socket) {
    util.log('Got a socket.IO connection');
  });
}

util.inherits(Push, EventEmitter);

Push.prototype.start = function start(callback) {
  var self = this;
  
  setInterval(function(param) {
    stats.push_average(self.io);
  }, self.interval);
  callback();
}

Push.prototype.push_notify = function push_notify(notify, callback) { 
  var self = this;
  self.io.sockets.emit('notify', { type: 'notify', message: notify}); 
  callback();
}

Push.prototype.push_error = function push_error(notify, callback) {
  var self = this;
  self.io.sockets.emit('notify_error', {type: 'error', message: notify});
  callback();
}

Push.prototype.push_stats = function push_error(callback) {
  // TODO
  callback();
}

//
// @json : fps as JSON, provided by 'measured'
// @name : name of the fps
// @callback : function(err)
//
Push.prototype.push_fps = function push_notify(json, name, callback) { 
  var self = this;
  self.io.sockets.emit('fps_' + name, { type: 'fps', message: json}); 
  callback();
}

exports.Push = Push;
