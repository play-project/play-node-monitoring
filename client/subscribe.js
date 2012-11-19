/**
 * PLAY live monitoring
 *
 * Some subcribe stuff...
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
    subscriber: "http://localhost:7373/subcriber",
    type: "newSubscribeRequest",
    topic: {
      name: "TestTopicSubscribe",
      ns: "http://play.ow2.org/subscribe",
      prefix:"p"
    },
    timestamp: new Date().getTime()
  }

  console.log('Sending subscribe message # ' + i + ' : ' , message);
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
  }, 1000);


