/**
 * PLAY live monitoring
 *
 * WSN Monitoring API. External WSN Engine must push data here.
 * Check documentation for data format.
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var stats = require('../../stats')
  //, push = require('../../push')
  , middleware = require('../../middleware/request/monitoring')
  , server = require('../../server')
  , io = server.io;

var noop = function() {};

exports.path = '/monitoring/wsn';

/**
 * Creates the WSN API
 *
 * @param prefix
 * @param callback
 */
exports.init = function(prefix, cb) {

  var app = server.app;
  var self = this;

  /**
   * Get WSN stats
   */
  app.get(prefix + exports.path, middleware.api, function(req, res) {
    res.json(200, {status : 'Nothing here'});
  });

  /**
   * Post new monitoring data
   */
  app.post(prefix + exports.path, middleware.business, function(req, res) {

    var notify = {};
    notify.date = new Date().toGMTString();
    notify.data = req.body;

    try {
      var type = req.body.type;
      handlers[type].call(null, notify);
    } catch (e) {
      console.log(e);
      console.log('Undefined handler for ' + type + ' message type');
      res.json(500, {error : 'undefined type ' + type});
    }

    res.send(200);
  });

  cb();
}

var handlers = {
  newOutNotifyError : function(notify, cb) {
    console.log('newOutNotifyError');
    push_error(notify, noop);
  },
  newInNotifyError : function(notify, cb) {
    console.log('newOutNotifyError');
    push_error(notify, noop);
  },
  newInNotifyInput : function(notify, cb) {
    console.log('newInNotifyInput');
    push_notify(notify, noop);
  },
  newInNotifyOutput : function(notify, cb) {
    console.log('newInNotifyOutput');
    push_notify(notify, noop);
  }
}

var push_notify = function(notify, cb) {
  io.sockets.emit('notify', { type: 'notify', message: notify});
  if (cb) cb();
}

var push_error = function(notify, cb) {
  io.sockets.emit('notify_error', {type: 'error', message: notify});
  if (cb) cb();
}
