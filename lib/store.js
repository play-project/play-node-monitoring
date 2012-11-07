/*!
 * PLAY live monitoring
 * Permanent store using mongodb
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */
 
var mongoose = require('mongoose');

var db = mongoose.createConnection('localhost', 'play-governance-monitoring');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to mongodb store...');
});
     
var out_error_schema = mongoose.Schema({
  uuid: 'string',
  type: 'string',
  topic: {
    name : 'string',
    ns : 'string',
    prefix : 'string'
  },
  timestamp : 'number',
  error : 'string',
  to : 'string'
});

var OutNotifyError = db.model('OutNotifyError', out_error_schema);

// Store an error
function store_error(json, callback) {
  //console.log('Storing error to mongo ', json.data);
  var error = new OutNotifyError(json.data);
  
  // FIXME do not care for now...
  return;
  
  error.save(function (err) {  
    if (err) {
      console.log('Storage error : ' + err);
    }
    console.log('Error successfully stored');
    callback(err);
  });
}

// List all the errors
function list_errors(callback) {
  
}

exports.list_errors = list_errors;
exports.store_error = store_error;