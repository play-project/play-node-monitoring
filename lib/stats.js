/*!
 * PLAY live monitoring
 * PutGet stats, backed by redis if available
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */
 
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

exports.new_api_call = function(req) {
  api_stats.calls ++;
  api_stats.last_call_date = new Date();
}

exports.api_request_stats = function() {
  return api_stats;
}

exports.started = function() {
  request_stats.start_date = new Date();
}

exports.push_average = function(io) {
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

// There is a new business call
exports.new_call = function(req) {
  var total_requests;
  redis_client.incr("requests", function (err, reply) {
    total_requests = reply;
  });  
  request_stats.requests ++;
  request_stats.last_call_date = new Date();
  request_stats.cache_last_ten ++;    
}

exports.new_in_call = function() {
  var total_requests;
  redis_client.incr("in_calls", function (err, reply) {
    total_requests = reply;
  });  
  request_stats.in ++;
}

exports.new_out_call = function() {
  var total_requests;
  redis_client.incr("out_calls", function (err, reply) {
    total_requests = reply;
  });
  request_stats.out ++;
}

exports.new_in_error = function() {
  var total_requests;
  redis_client.incr("in_errors", function (err, reply) {
    total_requests = reply;
  });
  in_errors.count ++;
  in_errors.last_date = new Date();
}

exports.new_out_error = function() {
  var total_requests;
  redis_client.incr("out_errors", function (err, reply) {
    total_requests = reply;
  });
  out_errors.count ++;
  out_errors.last_date = new Date();
}

exports.stats = function() {
  return {
    api_stats : api_stats,
    request_stats : request_stats,
    errors : {
      in : in_errors,
      out : out_errors
    }
  };
}

exports.storage_error = function() {
  redis_client.incr("storage_errors", function (err, reply) {
    total_requests = reply;
  });
}