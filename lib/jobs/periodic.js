/**
 * PLAY live monitoring
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var stats = require('../stats')
  , server = require('../server')
  , io = server.io;

/**
 *
 * @param cb
 */
exports.init = function(cb) {

  // note, access to socket.io directly in to avoir context problems... direcly call io.xxx does not work.
  setInterval(function(param) {
    stats.push_average(server.io);
  }, 5000);

  setInterval(function(param) {
    var s = stats.getEvent('api-services');
    if (!s) {
      return;
    }
    server.io.sockets.emit('fps_api-business', {type : 'fps', message : s.toJSON()});
  }, 1000);

}