/*!
 * PLAY live monitoring
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */
 
var config = require('../util/config').config;
var backends = require('./backends');

// The cached client instance
var cache = null;

/**
 * Get a client defined from the configuration.
 */ 
exports.getClient = function getClient() {
  var backend = config.database.backend, settings = config.database.settings;

  if (!cache) {
    if (backend === 'redis') {
      cache = new backends.redis(settings);
    } else {
      // we only support redis for now...
      throw new Error('Unsupported backend: ' + backend);
    }
  }
  return cache;
};
