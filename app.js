/**
 * 
 *  CAPSTONE PROJECT 2017
 * 
 */

// Logging Framework
var logger   = require('winston');

// Web App Framework
var express   = require('express');
var app       = express();
var http      = require('http');
var server    = http.Server(app);

//  WebSockets module
var io        = require('socket.io')(server);    

var PORT      = process.env.PORT || 3000;

// Load game lobby
var Lobby     = require('./game/lobby.js');
var lobby     = new Lobby();

// Define static files directory
app.use(express.static('public'));

// Logging example

// Set logging level 
// TODO: configure from environment variable
logger.level = 'debug';

logger.log('debug', 'Just your standard debug message.');
logger.log('info', 'Here\'s some info', {
    thing : 'thing-value'
});
logger.log('warn', 'Things are getting quite bad...');
logger.log('error', 'Catastrophe', {
    message : 'The end is nigh'
});

// Server static page
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// Handle new connection
io.on('connection', function(socket) {
    console.log('A client has connected...');

    socket.on('join_request', function(data) {
        console.log('Join Request');
        lobby.assign_player(socket, data);
    });

    socket.on('reset_game', function() {
        lobby.reset_game();
    });

});

server.listen(PORT, function() {
    console.log('Listening on port: ' + PORT);
});