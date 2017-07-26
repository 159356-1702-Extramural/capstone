/**
 * 
 *  CAPSTONE PROJECT 2017
 * 
 */

var express   = require('express');
var app       = express();

var http      = require('http');
var server    = http.Server(app);
var io        = require('socket.io')(server);    

var PORT      = process.env.PORT || 3000;

// Define static file directory
app.use(express.static('public'));

// Server static page
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// Handle new connection
io.on('connection', function(socket) {
    console.log('A client has connected...');
});

server.listen(PORT, function() {
    console.log('Listening on port: ' + PORT);
});