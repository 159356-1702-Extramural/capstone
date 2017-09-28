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

// Serve static page
app.get('/', function(req, res) {
    var testing;
    var startWithCards;
    var playerNum;
    var setupGame;
    var robber;
    var dev_card;
    //start with testing set to false
    process.env['testing'] = 'false';

    //set environment variable if {url}:3000/?fixedDice=true is queried
    testing = req.query["fixedDice"];
    if(typeof testing === 'undefined'){testing = 'false';}
    process.env['testing'] = testing;

    //set environment variable if {url}:3000/?startWithCards=true is queried
    startWithCards = req.query["startWithCards"];
    if(typeof startWithCards === 'undefined'){startWithCards = 0;}
    process.env['startWithCards'] = parseInt(startWithCards);

    //set environment variable for 4 players if {url}:3000/?players=4 is queried  --> {url}:3000/?test=true&players=4
    playerNum = req.query["players"];
    if(typeof playerNum === 'undefined'){playerNum = 4}
    process.env['players'] = parseInt(playerNum);

    // skip setup phase using {url}:3000/?setup=skip
    setupGame = req.query["setup"];
    if(typeof setupGame === 'undefined'){setupGame = 'continue'}
    process.env['setup'] = setupGame;

    // disable the robber using {url}:3000/?robber=disabled
    robber = req.query["robber"];
    if(typeof robber === 'undefined'){robber = 'enabled'}
    process.env['robber'] = robber;
    logger.log('debug', 'Robber is '+process.env['robber']);

    dev_card = req.query["dev_card"];
    if(typeof dev_card === 'undefined'){dev_card = 'disabled'}
    process.env['dev_card'] = dev_card;

    // TODO: Change this to display lobby page
    res.sendFile(__dirname + '/views/default.html');
});

// Serve prototype
app.get('/prototype', function(req, res) {
    res.sendFile(__dirname + '/views/prototype_default.html');
});

// Handle new socket connection
io.on('connection', function(socket) {
    logger.log('info', 'A client has connected...');

    socket.on('display_lobby', function() {
        logger.log('info', 'Lobby requested');
        games.send_lobby_data(socket);
    });

    socket.on('new_game', function(player, game_detail) {
        logger.log('info', 'New game creation with players = '+game_detail);
        games.new_game(socket, player, game_detail);
    });

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
