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

var outnotifyerror = 'OutNotifyError'
  , innotifyerror = 'InNotifyError'
  , innotifyinput = 'InNotifyInput'
  , innotifyoutput = 'InNotifyOutput'
  , outnotify = 'OutNotify';


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

    redis.hgetall(outnotifyerror, function (err, reply) {
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

    redis.hgetall(innotifyerror, function (err, reply) {
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

    redis.hgetall(innotifyinput, function (err, reply) {
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

    redis.hgetall(innotifyoutput, function (err, reply) {
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

  /**
   * Clear the stats
   */
  app.get(prefix + exports.path + '/clear', middleware.api, function(req, res) {
    redis.del(outnotifyerror);
    redis.del(outnotify);
    redis.del(innotifyerror);
    redis.del(innotifyinput);
    redis.del(innotifyoutput);

    res.json(200, {status : 'done'});
  });

  if (cb) cb();
}

/**
 * handlers per notification message type
 *
 * @type {Object}
 */
var handlers = {

  /**
   * Called when an error occurs when sending a notification to subscriber
   *
   * @param notify
   * @param cb
   */
  newOutNotifyError : function(notify, cb) {
    redis.hincrby(outnotifyerror, notify.data.topic.ns + '/' + notify.data.topic.name, 1);
    wsn_store.store_out_error(notify.data, function(err) {
      if (err) {
        console.log('Got an error while storing message to database', err);
      }
    });
    push_error(notify, noop);
  },

  /**
   * Called when an error occurs when receiving a notification on the engine
   *
   * @param notify
   * @param cb
   */
  newInNotifyError : function(notify, cb) {
    redis.hincrby(innotifyerror, notify.data.topic.ns + '/' + notify.data.topic.name, 1);
    push_error(notify, noop);
  },

  /**
   * Called when a notification is received on the notification egine ie before subscribers retrieval
   *
   * @param notify
   * @param cb
   */
  newInNotifyInput : function(notify, cb) {
    redis.hincrby(innotifyinput, notify.data.topic.ns + '/' + notify.data.topic.name, 1);
    push_notify(notify, noop);
  },

  /**
   * Called when the input notification has been delivered to all the subscribers ie after processing
   *
   * @param notify
   * @param cb
   */
  newInNotifyOutput : function(notify, cb) {
    redis.hincrby(innotifyoutput, notify.data.topic.ns + '/' + notify.data.topic.name, 1);
    push_notify(notify, noop);
  },

  /**
   * Called when a notification has been sent to the subscriber
   *
   * @param notify
   * @param cb
   */
  newOutNotify : function(notify, cb) {
    redis.hincrby(outnotify, notify.data.topic.ns + '/' + notify.data.topic.name, 1);
    push_notify(notify, noop);
  }
}

/**
 * Push a notification to the socket.io instance
 * TODO : eventemitter
 *
 * @param notify
 * @param cb
 */
var push_notify = function(notify, cb) {
  io.sockets.emit('notify', { type: 'notify', message: notify});
  if (cb) cb();
}

/**
 * Push a notification to the socket.io instance
 * TODO : eventemitter
 *
 * @param notify
 * @param cb
 */
var push_error = function(notify, cb) {
  io.sockets.emit('notify_error', {type: 'error', message: notify});
  if (cb) cb();
}
