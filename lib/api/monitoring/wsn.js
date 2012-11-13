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
  , config = require('../../util/config').config
  , middleware = require('../../middleware/request/monitoring')
  , server = require('../../server')
  , redis = require('../../db/').getClient()._getClient()
  , wsn_store = require('../../storage/wsn')
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
   * Per topic output errors hash
   */
  app.get(prefix + exports.path + '/errors/out', middleware.api, function(req, res) {

    redis.hgetall("OutNotifyError", function (err, reply) {
      if (err) {
        res.send(500, err);
      }

      var result = {};
      if (reply === null) {
        res.json(200, result);
      } else {
        Object.keys(reply).forEach(function (topic) {
          result[topic] = reply[topic];
        });
      }
      res.json(200, result);
    });
  });

  /**
   * Per topic input errors hash
   */
  app.get(prefix + exports.path + '/errors/in', middleware.api, function(req, res) {

    redis.hgetall("InNotifyError", function (err, reply) {
      if (err) {
        res.send(500, err);
      }

      var result = {};
      if (reply === null) {
        res.json(200, result);
      } else { Object.keys(reply).forEach(function (topic) {
          result[topic] = reply[topic];
        });
      }

      res.json(200, result);
    });
  });

  /**
   * Per topic input notification hash
   */
  app.get(prefix + exports.path + '/notify/in', middleware.api, function(req, res) {

    redis.hgetall("InNotifyInput", function (err, reply) {
      if (err) {
        res.send(500, err);
      }

      var result = {};
      if (reply === null) {
        res.json(200, result);
      } else {
        Object.keys(reply).forEach(function (topic) {
          result[topic] = reply[topic];
        });
      }

      res.json(200, result);
    });
  });

  app.get(prefix + exports.path + '/errors/out/last', middleware.api, function(req, res) {
    wsn_store.get_out_errors(function(err, data) {
      if (err) {
        res.json(200, {error : "Error while getting data from storage", message : err});
      } else {
        res.json(200, data);
      }
    });
  });

  /**
   * Per topic output notification hash
   */
  app.get(prefix + exports.path + '/notify/out', middleware.api, function(req, res) {

    redis.hgetall("InNotifyOutput", function (err, reply) {
      if (err) {
        res.send(500, err);
      }

      var result = {};
      if (reply === null) {
        res.json(200, result);
      } else {
        Object.keys(reply).forEach(function (topic) {
          result[topic] = reply[topic];
        });
      }

      res.json(200, result);
    });
  });

  /**
   * Post new monitoring data, check benchmarks files for payload format.
   */
  app.post(prefix + exports.path, middleware.business, function(req, res) {

    var notify = {
      date : new Date().toGMTString(),
      data : req.body
    };

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

  /**
   * Backward compatibility, same as previous method. TO be removed on platform update.
   */
  app.post('/monitoring/dsb/wsn/', middleware.business, function(req, res) {

    var notify = {
      date : new Date().toGMTString(),
      data : req.body
    };

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

  if (cb) cb();
}

/**
 * handlers per notification message type
 *
 * @type {Object}
 */
var handlers = {
  newOutNotifyError : function(notify, cb) {
    console.log('newOutNotifyError');
    redis.hincrby('OutNotifyError', notify.data.topic.ns + '/' + notify.data.topic.name, 1);
    wsn_store.store_out_error(notify.data, function(err) {
      if (err) {
        console.log('Got an error while storing message to database', err);
      }
    });
    push_error(notify, noop);
  },

  newInNotifyError : function(notify, cb) {
    console.log('newInNotifyError');
    redis.hincrby('InNotifyError', notify.data.topic.ns + '/' + notify.data.topic.name, 1);
    push_error(notify, noop);
  },

  newInNotifyInput : function(notify, cb) {
    console.log('newInNotifyInput');
    redis.hincrby('InNotifyInput', notify.data.topic.ns + '/' + notify.data.topic.name, 1);
    push_notify(notify, noop);
  },

  newInNotifyOutput : function(notify, cb) {
    console.log('newInNotifyOutput');
    redis.hincrby('InNotifyOutput', notify.data.topic.ns + '/' + notify.data.topic.name, 1);
    push_notify(notify, noop);
  },

  newOutNotify : function(notify, cb) {
    console.log('newOutNotify');
    redis.hincrby('OutNotify', notify.data.topic.ns + '/' + notify.data.topic.name, 1);
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
