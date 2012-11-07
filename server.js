/*!
 * PLAY live monitoring
 * Copyright(c) 2012 Christophe Hamerling <chamerling@linagora.com>
 * MIT Licensed
 */

var express = require('express')
  , path = require('path')
  , app = express()
  , http = require('http')
  , io = require('socket.io')
  , api_stats = require('./lib/api_stats')
  , wsn_stats = require('./lib/wsn_stats')
  
app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.static(path.join(__dirname, 'public')));
});
    
var server = http.createServer(app);
io = io.listen(server);

app.get('/', function(req, res) {
  res.redirect("/static/index.html");
});

// API V1

app.get('/api/v1/calls', function(req, res) {
  res.json(api_stats.stats());
});

app.get('/api/v1/stats', apiStats, function(req, res) {
  res.json(
    {
      api : api_stats.stats(),
      wsn : wsn_stats.stats()
    }
  );
});

// Collecting Monitoring
app.post('/monitoring/dsb/wsn/', monitoringStats, function(req, res) {

  var notify = {};
  notify.date = new Date().toGMTString();
  notify.data = req.body;
  
  // check errors...
  var type = JSON.stringify(req.body.type);
  if (type.indexOf('Error') != -1 || type.indexOf('error') != -1) {
    push_error(notify, function(err) {
      if (err) {
        res.send(500, err);
      } 
      res.send(200);
    });

  } else {
    push_notify(notify, function(err) {
      if (err) {
        res.send(500, err);
      }
      res.send(200);
    });
  }
  res.send(200);
});

io.sockets.on('connection', function (socket) {
  console.log("Got a connection to socket.io channel");
});

// Timers

setInterval(function(param) {
  wsn_stats.push_average(io);
}, 10000);

server.listen(app.get('port'), function () {
    console.log("Monitoring server listening on port " + app.get('port'));
    // TODO EventEmitter
    wsn_stats.started();
});

//
// Handle business notifications
//

function push_notify(notify, callback) {
  var type = JSON.stringify(notify.data.type);
  if (type.indexOf('out') != -1 || type.indexOf('Out') != -1) {
    wsn_stats.new_out_call();
  }
  if (type.indexOf('in') != -1 || type.indexOf('In') != -1) {
    wsn_stats.new_in_call()
  }
  
  // TODO : EventEmitter
  io.sockets.emit('notify', { type: 'notify', message: notify}); 
  callback();
}

function push_error(notify, callback) {  
  var type = JSON.stringify(notify.data.type);
  if (type.indexOf('out') != -1 || type.indexOf('Out') != -1) {
    wsn_stats.new_out_error();
  }
  if (type.indexOf('in') != -1 || type.indexOf('In') != -1) {
    wsn_stats.new_in_error();
  }
  io.sockets.emit('notify_error', {type: 'error', message: notify});
  callback();
}

// Middleware

function monitoringStats(req, res, next) {
  wsn_stats.new_call();
  next();
}

function apiStats(req, res, next) {
  api_stats.new_call();
  next();
}