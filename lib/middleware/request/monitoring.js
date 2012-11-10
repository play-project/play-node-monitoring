/*!
 * PLAY live monitoring
 *
 * Monitoring incoming requests
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */
 
var stats = require('../../stats');

exports.business = function(req, res, next) {
  stats.new_call(req);
  stats.newEvent('api-services');
  next();
}

exports.wsn = function(req, res, next) {
  stats.new_call(req);
  stats.newEvent('api-wsn');
  next();
}

exports.api = function(req, res, next) {
  stats.newEvent('api-api');
  stats.new_api_call(req);
  next();
}