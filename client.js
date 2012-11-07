/*!
 * PLAY live monitoring
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var io = require('socket.io-client');
var port = 3000;
var host = 'localhost';
var socket = io.connect('http://localhost:3000');

socket.on('connect', function () {
  console.log('Client socket is connected to remote host');
});

socket.on('disconnect', function () {
  console.log('Socket has been disconnected from remote host');
});

socket.on('data', function(data) {
  console.log('Got a message from the server : ' + data);
});

socket.on('notify', function(data) {
  console.log('Got a notify from the server : ' + JSON.stringify(data, null, 4));
});

console.log('Waiting messages from the server...')