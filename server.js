/*!
 * node socket.io client
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
  
var port = process.env.PORT || 8334;
app.use(express.bodyParser());  
app.use('/static', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.redirect("/static/index.html");
});

app.post('/monitoring/dsb/wsn/', function(req, res) {
  var notify = {};
  notify.date = new Date().toGMTString();
  notify.data = req.body;
    
  push_notify(notify, function(req, res) {
    res.send({error : 'Something is bad...'}, 500);
  });
  res.send();
});

io.sockets.on('connection', function (socket) {
  console.log("Got a connection to socket.io channel");
});

server.listen(port);
console.log('Server is started on ' + port);

function push_notify(notify, callback) {
  // store it : TODO
  io.sockets.emit('notify', { type: 'notify', message: notify});  
}