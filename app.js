/**
 * PLAY live monitoring
 *
 * Starts the monitoring stuff with the default configuration file.
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var monitoring = require('./lib/monitor')
  , config = require('./lib/util/config')
  , util = require('util');

config = config.loadConfig('./config.json');

monitoring.start(function(err) {
  if (err) {
    // fail
  } else {
    util.log('Monitoring is started...');
  }
});
