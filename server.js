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

var stats = {
  requests : 0,
  average_since_start : 0,
  average_last_ten : 0,
  cache_last_ten : 0,
  last_call_date : null,
  in : 0,
  out : 0
}

var errors = {
  count : 0,
  in : 0,
  out : 0,
  last_date : null
}

var start_date;

app.get('/', function(req, res) {
  res.redirect("/static/index.html");
});

app.get('/api/v1/stats', function(req, res) {
  res.json(stats);
});

app.get('/api/v1/errors', function(req, res) {
  res.json(errors);
});

app.post('/monitoring/dsb/wsn/', function(req, res) {
  stats.last_call_date = new Date().toGMTString();

  var notify = {};
  notify.date = new Date().toGMTString();
  notify.data = req.body;
  stats.requests ++;
  stats.cache_last_ten ++;

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
});

io.sockets.on('connection', function (socket) {
  console.log("Got a connection to socket.io channel");

  // send data to the new client
  socket.emit('average_since_start', { type: 'mean', message: stats.average_since_start});

});

// global average since start
setInterval(function(param) {
  var fps = 0;
  if (stats.requests > 0) {
    //console.log("Request since start ", requests);
    fps = stats.requests / ((new Date() - start_date) / 1000);
  }
  stats.average_since_start = fps;
  //console.log('Mean since start : ', fps);
  io.sockets.emit('average_since_start', { type: 'mean', message: fps});  
}, 1000);

// average in the last ten seconds
setInterval(function(param) {
  // reinitialize counters each 10 seconds and give an average
  if (stats.cache_last_ten === 0) {
    io.sockets.emit('average_last_ten', { type: 'average', message: 0});  
    return;
  }

  var average = stats.cache_last_ten / 10;
  //console.log("Mean last 10 seconds : ", mean);
  io.sockets.emit('average_last_ten', { type: 'average', message: average});  
  stats.cache_last_ten = 0;
  stats.average_last_ten = average;
}, 10000);

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
    start_date = new Date();
});

//
// Handle business notifications
//
function push_notify(notify, callback) {
  // store it : TODO

  var type = JSON.stringify(notify.data.type);
  if (type.indexOf('out') != -1 || type.indexOf('Out') != -1) {
    stats.out ++;
  }
  if (type.indexOf('in') != -1 || type.indexOf('In') != -1) {
    stats.in ++;
  }

  io.sockets.emit('notify', { type: 'notify', message: notify}); 
  callback();
}

//
// Handle error messages
//
function push_error(notify, callback) {
  errors.count ++;
  errors.last_date = new Date();
  
  var type = JSON.stringify(notify.data.type);
  if (type.indexOf('out') != -1 || type.indexOf('Out') != -1) {
    errors.out ++;
  }
  if (type.indexOf('in') != -1 || type.indexOf('In') != -1) {
    errors.in ++;
  }

  io.sockets.emit('notify_error', {type: 'error', message: notify});
  callback();
}