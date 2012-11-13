/**
 * PLAY live monitoring
 *
 * Some test stuff...
 *
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var request = require('request')
  , uuid = require('node-uuid');

var url = 'http://localhost:3000/api/v1/monitoring/wsn/';
var i = 0;

var id = setInterval(function() {
  var message = {
    uuid: uuid.v1(),
    type: "newOutNotifyError",
    topic: {
      name: "TestTopic",
      ns: "http://play.ow2.org",
      prefix:"play"
    },
    timestamp: new Date().getTime(),
    "error": "This is the error message #" + i,
    "to" : "http://localhost:8383/foo/bar"
  }

  console.log('Sending message # ' + i + ' : ' , message);
  i++;

  if (i == 1000) {
    // kill me...
    clearInterval(id);
  }

  var start = new Date().getTime();
  request.post(
    {
      url: url,
      method: 'post',
      body: message,
      json: true
    },
    function(error, response, body) {
      var diff = new Date().getTime() - start;
      if (error) {
        console.log('Error ', error);
      } else {
        console.log('Response for request # ' + i + ' (' + diff + ' ms) : ' + response.statusCode + ' : ', body);
      }
    })
  }, 100);


