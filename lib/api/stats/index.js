/**
 * PLAY live monitoring
 *
 * Stats API
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var stats = require('../../stats')
//  , push = require('../../push')
  , server = require('../../server')
  , middleware = require('../../middleware/request/monitoring');

exports.path = '/stats';

/**
 * Creates the WSN API
 *
 * @param prefix
 * @param callback
 */
exports.init = function(prefix, callback) {

  var app = server.app;

  /**
   * Get WSN stats
   */
  app.get(prefix + exports.path, middleware.api, function(req, res) {
    res.json(stats.stats());
  });

  /**
   *
   */
  app.get(prefix + exports.path + '/events', middleware.api, function(req, res) {
    res.json(stats.getEvents());
  });

  /**
   * Post new stats data
   */
  app.post(prefix + exports.path, middleware.business, function(req, res) {
    // process the payload

  });

  // out errors per endpoint
  app.get(prefix + exports.path + '/errors/out', middleware.api, function(req, res) {
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
  app.get(prefix + exports.path + '/errors/in', middleware.api, function(req, res) {
    res.json(200, {
      result : {
        description : 'nb of input error',
        data : 'TODO'
      }
    });
  });


  callback();
}