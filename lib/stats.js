/*!
 * PLAY live monitoring
 * PutGet stats, backed by redis if available
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var Meter = require('measured').Meter;

var redis_client = require("redis").createClient();
redis_client.on('error', function(err) {
  console.log("Redis Client Error: " + err);
});

var request_stats = {
  start_date : null,
  requests : 0,
  average_since_start : 0,
  average_last_ten : 0,
  cache_last_ten : 0,
  last_call_date : null,
  in : 0,
  out : 0
}

var in_errors = {
  count : 0,
  last_date : null
}

var out_errors = {
  count : 0,
  last_date : null
}

var api_stats = {
  calls : 0,
  last_call_date : null
}

function new_api_call(req) {
  api_stats.calls ++;
  api_stats.last_call_date = new Date();
}
exports.new_api_call = new_api_call;

function api_request_stats() {
  return api_stats;
}
exports.api_request_stats = api_request_stats;

function started() {
  request_stats.start_date = new Date();
  return request_stats;
}
exports.started = started;

function push_average(io) {
  var fps = 0;
  if (request_stats.requests > 0) {
    fps = request_stats.requests / ((new Date() - request_stats.start_date) / 1000);
  }
  request_stats.average_since_start = fps;
  io.sockets.emit('average_since_start', { type: 'mean', message: fps});  
  
  if (request_stats.cache_last_ten === 0) {
    io.sockets.emit('average_last_ten', { type: 'average', message: 0});  
  } else {
    var average = request_stats.cache_last_ten / 10;
    io.sockets.emit('average_last_ten', { type: 'average', message: average});  
    request_stats.cache_last_ten = 0;
    request_stats.average_last_ten = average;
  }  
}
exports.push_average = push_average;

function update_notify(notify) {
  if (notify && notify != 'undefined' && notify != undefined) {
    var type = JSON.stringify(notify.data.type);
  
    if (type.indexOf('out') != -1 || type.indexOf('Out') != -1) {
      new_out_call();
    }
    if (type.indexOf('in') != -1 || type.indexOf('In') != -1) {
      new_in_call()
    }
  }
}
exports.update_notify = update_notify;

function update_error(notify) {
  if (notify && notify != 'undefined' && notify != undefined) {
    var type = JSON.stringify(notify.data.type);
    
    if (type.indexOf('out') != -1 || type.indexOf('Out') != -1) {
      new_out_error();
      
      // update map of error per endpoint
      redis_client.hincrby("outerror", notify.data.to, 1);
    }
    if (type.indexOf('in') != -1 || type.indexOf('In') != -1) {
      new_in_error();
    }
  }
}
exports.update_error = update_error;

// @param callback(error, json)
function stats_out_error(callback) {
  redis_client.hgetall("outerror", function (err, reply) {
    if (err) {
      callback(err);
    } else {
      var result = {};
      Object.keys(reply).forEach(function (ip) {
        result[ip] = reply[ip];
      });
      callback(null, result);
    }
  });
}
exports.stats_out_error = stats_out_error;

// There is a new business call
function new_call(req) {
  var total_requests;
  redis_client.incr("requests", function (err, reply) {
    total_requests = reply;
  });  
  request_stats.requests ++;
  request_stats.last_call_date = new Date();
  request_stats.cache_last_ten ++;    
}
exports.new_call = new_call;

function new_in_call() {
  var total_requests;
  redis_client.incr("in_calls", function (err, reply) {
    total_requests = reply;
  });  
  request_stats.in ++;
}
exports.new_in_call = new_in_call;

function new_out_call() {
  var total_requests;
  redis_client.incr("out_calls", function (err, reply) {
    total_requests = reply;
  });
  request_stats.out ++;
}
exports.new_out_call = new_out_call;

function new_in_error() {
  var total_requests;
  redis_client.incr("in_errors", function (err, reply) {
    total_requests = reply;
  });
  in_errors.count ++;
  in_errors.last_date = new Date();
}
exports.new_in_error = new_in_error;

function new_out_error() {
  var total_requests;
  redis_client.incr("out_errors", function (err, reply) {
    total_requests = reply;
  });
  out_errors.count ++;
  out_errors.last_date = new Date();
}
exports.new_out_error = new_out_error;

function stats() {
  return {
    api_stats : api_stats,
    request_stats : request_stats,
    errors : {
      in : in_errors,
      out : out_errors
    }
  };
}
exports.stats = stats;

function storage_error() {
  redis_client.incr("storage_errors", function (err, reply) {
    total_requests = reply;
  });
}
exports.storage_error = storage_error;

// new API, simple enough... //

var events = {};
var complexEvents = {};

// Record a new event, creates if needed
exports.newEvent = function(label) {
  if (!events[label]) {
    events[label] = new Meter();
  }
  events[label].mark(1);
}

exports.getEvent = function(label) {
  return events[label];
}

exports.getEvents = function() {
  var result = [], key;

  for (key in events) {
    if (events.hasOwnProperty(key)) {
      result.push({name : key, metric : exports.getEvent(key)});
    }
  }
  return result; 
}