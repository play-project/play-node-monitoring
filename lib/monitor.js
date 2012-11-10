/**
 * PLAY live monitoring
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var server = require('./server')
  , api = require('./api/v1')
  , periodic = require('./jobs/periodic')
  , config = require('./util/config').config;

var util = require('util');

/**
 * Start the monitoring engine
 *
 * @param callback
 */
exports.start = function(callback) {
  server.start(function(err) {
    if (err) {
      util.log('Error while starting the server', e);
      return;
    }

    api.start(function(err, apis) {
      if (err) {
        util.log('Error while starting API', e);
        return;
      }

      util.log('API are started');

      periodic.init(function() {
        console.log('Started');
      })
    });


  })
}