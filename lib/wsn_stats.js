/*!
 * PLAY live monitoring
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var stats = {
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

exports.started = function() {
  stats.start_date = new Date();
}

exports.push_average = function(io) {
  var fps = 0;
  if (stats.requests > 0) {
    fps = stats.requests / ((new Date() - stats.start_date) / 1000);
  }
  stats.average_since_start = fps;
  io.sockets.emit('average_since_start', { type: 'mean', message: fps});  
  
  if (stats.cache_last_ten === 0) {
    io.sockets.emit('average_last_ten', { type: 'average', message: 0});  
  } else {
    var average = stats.cache_last_ten / 10;
    io.sockets.emit('average_last_ten', { type: 'average', message: average});  
    stats.cache_last_ten = 0;
    stats.average_last_ten = average;
  }  
}

exports.new_call = function() {
  stats.requests ++;
  stats.last_call_date = new Date();
  stats.cache_last_ten ++;    
}

exports.new_in_call = function() {
  stats.in ++;
}

exports.new_out_call = function() {
  stats.out ++;
}

exports.new_in_error = function() {
  in_errors.count ++;
  in_errors.last_date = new Date();
}

exports.new_out_error = function() {
  out_errors.count ++;
  out_errors.last_date = new Date();
}

exports.stats = function() {
  return {
    stats : stats,
    errors : {
      in : in_errors,
      out : out_errors
    }
  };
}