/**
 * PLAY live monitoring
 * Load configuration from a JSON file
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */
 
var fs = require('fs');

exports.config = {};

exports.loadConfig = function loadConfig(configPath) {
  var content = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  exports.config = content;
  return exports.config;
};