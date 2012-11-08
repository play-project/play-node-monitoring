/*!
 * PLAY live monitoring
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var stats = require('../stats')
  , events = require('events')
  , EventEmitter = events.EventEmitter
  , inherits = require('util').inherits
  , redis = require("redis");

/** 
 * Constructor
 */
var V1 = function V1(app) {
  EventEmitter.call(this);
  this.app = app;  
}

inherits(V1, EventEmitter);
exports.V1 = V1;

/**
 * Start the API
 */
V1.prototype.start = function start(callback) {
  var self = this;
  redis_client = redis.createClient();
  redis_client.on('error', function(err) {
    console.log("Redis Client Error: " + err);
  });
  
  // Stats
  self.app.get('/api/v1/stats', apiStats, function(req, res) {
    res.json(stats.stats());
  });
  
  // out errors per endpoint
  self.app.get('/api/v1/stats/errors/out', apiStats, function(req, res) {
    console.log('GET Errors');
    
    var result = stats.stats_out_error(function(err, result) {
      if (err) {
        res.send(500, {error : 'Data is not available'});
      } else {
        // array of [endpoint, failure];
        res.json(200, {
          result : {
            description : 'nb of errors per subscriber', 
            data : result
          }
        });
      }
    });
  });
  
  // in error stats
  self.app.get('/api/v1/stats/errors/in', apiStats, function(req, res) {
    res.json(200, {
      result : {
        description : 'nb of input error', 
        data : 'TODO'
      }
    });
  });
  
  // DSB WSN Monitoring
  self.app.post('/api/v1/monitoring/dsb/wsn/', monitoringStats, function(req, res) {
    var notify = {};
    notify.date = new Date().toGMTString();
    notify.data = req.body;
  
    var type = JSON.stringify(req.body.type);
    if (type.indexOf('Error') != -1 || type.indexOf('error') != -1) {
      self.emit('dsb_wsn_error', notify);
    } else {
      self.emit('dsb_wsn_notify', notify);
    }
    res.send(200);
  });   
  
  callback();
}

/**
 * Stop the API
 */
V1.prototype.stop = function stop(callback) {
  var self = this;
  
  callback();
}

/**
 * Add a route to the API
 */
V1.prototype.add_route = function add_route(path, method, middleware, fn) {
  // TODO
  var self = this;
}

// Middleware

function monitoringStats(req, res, next) {
  stats.new_call(req);
  next();
}

function apiStats(req, res, next) {
  stats.new_api_call(req);
  next();
}
