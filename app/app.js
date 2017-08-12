/**
 * 
 *  CAPSTONE PROJECT 2017
 * 
 */

// Logging Framework
var logger   = require('winston');

// TODO: can we set this from enviroment config?
logger.level = 'debug';

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

// Serve original idea from prototype
app.get('/', function(req, res) {    
    res.sendFile(__dirname + '/views/default.html');
});

// Handle new socket connection
io.on('connection', function(socket) {
    logger.log('info', 'A client has connected...');
    
    socket.on('join_request', function(data) {
        logger.log('info', 'Join Request');
        lobby.assign_player(socket, data);
    });

    socket.on('reset_game', function() {
        lobby.reset_game();
    });

});

server.listen(PORT, function() {
    logger.log('info', 'Listening on port: ' + PORT);
});