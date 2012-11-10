/**
 * PLAY live monitoring
 *
 * Services Monitoring API. External Services/Runtime must push stats data here.
 * Check documentation for data format.
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var stats = require('../../stats')
//, push = require('../../push')
  , middleware = require('../../middleware/request/monitoring')
  , server = require('../../server');

exports.path = '/monitoring/service';

/**
 * Creates the WSN API
 *
 * @param prefix
 * @param callback
 */
exports.init = function(prefix, callback) {

  var app = server.app;

  /**
   * Get services stats
   */
  app.get(prefix + exports.path, middleware.api, function(req, res) {
    res.json(200, {status : 'Nothing here... TODO'});
  });

  /**
   * Post new service information
   */
  app.post(prefix + exports.path, middleware.business, function(req, res) {
    // process the payload
    console.log('Got a post call, TODO');
  });

  callback();
}