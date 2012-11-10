/**
 * PLAY live monitoring
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var path = '/api/v1';
var noop = function() {};

/**
 * Start and send back the APIs
 *
 * @param cb(err, [apis])
 */
exports.start = function(cb) {
  var result = [];

  var wsn = require('./monitoring/wsn');
  wsn.init(path, noop);

  var service = require('./monitoring/service');
  service.init(path, noop);

  var stats = require('./stats/');
  stats.init(path, noop);

  var management = require('./management/')
  management.init(path, noop);
  result.push(wsn, stats, service, management);

  if (cb) {
    cb(null, result);
  }

}
