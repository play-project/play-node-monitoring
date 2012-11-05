/*!
 * node socket.io client
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var express = require('express')
  , path = require('path')
  , app = express()
  , http = require('http')
  , io = require('socket.io');
  
app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser())
  app.use(express.static(path.join(__dirname, 'public')));
});
    
var server = http.createServer(app);
io = io.listen(server);

//app.use('/static', express.static(__dirname + '/public'));

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

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

function push_notify(notify, callback) {
  // store it : TODO
  io.sockets.emit('notify', { type: 'notify', message: notify});  
}