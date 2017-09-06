/**
 *
 *  CAPSTONE PROJECT 2017
 *
 */

// Logging Framework
var logger   = require('./log.js');

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
var gm        = require('./game/games.js');
var games     = new gm.Games();

// Define static files directory
app.use(express.static('public'));

// boolean test flag for headless browser testing
var testing;

// Serve static page
app.get('/', function(req, res) {

    //start with testing set to false
    process.env['testing'] = 'false';

    //set environment variable if {url}:3000/?test=true is queried
    testing = req.query["test"];
    if(typeof testing === 'undefined'){testing = 'false';}
    process.env['testing'] = testing;

    res.sendFile(__dirname + '/views/default.html');
});

// Serve prototype
app.get('/prototype', function(req, res) {
    res.sendFile(__dirname + '/views/prototype_default.html');
});

// Handle new socket connection
io.on('connection', function(socket) {
    logger.log('info', 'A client has connected...');

    socket.on('join_request', function(data) {
        logger.log('info', 'Join Request');
        games.assign_player(socket, data);
    });

    socket.on('reset_game', function() {
        games.reset_game();
    });

});

server.listen(PORT, function() {
    logger.log('info', 'Listening on port: ' + PORT);
});
