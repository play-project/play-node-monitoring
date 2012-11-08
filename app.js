/**
 * PLAY live monitoring
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var Monitoring = require('./lib/monitoring').Monitoring
  , util = require('util');

var m = new Monitoring();
m.start(function(err) {
  if (err) {
    // fail
  } else {
    util.log('Monitoring is started!');    
  }
});
