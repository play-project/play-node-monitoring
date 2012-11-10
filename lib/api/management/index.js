/**
 * PLAY live monitoring
 *
 * Management API
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */


var server = require('../../server')
  , middleware = require('../../middleware/request/management');

exports.path = '/management';

/**
 * Creates the Management API
 *
 * @param prefix
 * @param callback
 */
exports.init = function(prefix, callback) {

  var app = server.app;

  /**
   *
   */
  app.get(prefix + exports.path, middleware.authorize, function(req, res) {
    res.json('OK');
  });

  callback();
}