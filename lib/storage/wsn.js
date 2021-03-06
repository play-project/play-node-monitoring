/**
 * PLAY live monitoring
 *
 * WSN messages storage
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var config = require('../util/config').config
  , mongoose = require('mongoose')
  , db = mongoose.createConnection(config.mongodb.host || 'localhost', config.mongodb.db || 'play-monitoring-store');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to mongodb store...');
});

var out_error_schema = mongoose.Schema(
  {
    // message UUID generated by the monitored platform
    uuid: 'string',
    // type of message In, Out, Error, Notify. Check doc for details
    type: 'string',
    // topic linked to the message
    topic: {
      name : 'string',
      ns : 'string',
      prefix : 'string'
    },
    // server side timestamp when the monitoring message has been generated
    timestamp : 'number',
    // error message
    error : 'string',
    // the error has occured when trying to call this endpoint
    to : 'string'
  },
  {
    capped:
      {
        size: 2048,
        max: 100,
        autoIndexId: true
      }
  }
);

// create the model
var OutNotifyError = db.model('OutNotifyError', out_error_schema);

/**
 * Store the output error to the store
 *
 * @param json
 * @param callback
 */
exports.store_out_error = function (json, callback) {
  var error = new OutNotifyError(json);
  error.save(function (err) {
    if (err) {
      console.log('Error : ', err);
    }
    if (callback) {
      callback(err);
    }
  });
}

/**
 * Get the ouput errors
 *
 * @param callback
 */
exports.get_out_errors = function(callback) {
  OutNotifyError.find(function(err, messages) {
    if (err) {
      callback(err);
    }
    callback(null, messages);
  });
}

