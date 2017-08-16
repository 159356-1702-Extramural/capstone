var logger = require('winston');
var board    = require('./board.js');

var Board    = require('./board.js');
var Data_package= require('../communal/data_package.js');

function Game(lobby) {

    // Reference to the game lobby
    this.lobby          = lobby;

    this.board          = new board.Board();

    this.max_players    = 2;
    this.players        = [];

    this.game_full      = false;
    this.round_num      = 1;

    this.player_colours = ['#F44336', // Red
                           '#2196F3', // Blue
                           '#4CAF50', // Green
                           '#FFEB3B']; // Yellow

    this.setupComplete  = false;
    this.setupSequence = [0,1,1,0];
    this.setupPointer = 0;

    this.development_cards = [];
}

// Adds a player to the game
Game.prototype.add_player = function(player) {

    var _self = this;

    console.log('adding player');

    // Add player to the game
    this.players.push(player);

    // Store the player id
    player.id = this.players.indexOf(player);

    // Assign a color to this player
    player.colour = this.player_colours[player.id];

    //  Send the player details
    player.socket.emit('player_id', { name : player.name, id : player.id, colour : player.colour });

    // Listen for game updates from this socket
    player.socket.on('game_update', function(data) {
        _self.game_update(data);
    });

    // Listen for a disconnect - if any player disconnects we'll need
    // to terminate the game
    player.socket.on('disconnect', function() {
        _self.broadcast('game_error', {
            message : player.name + ' has disconnected. Game Over.'
        });

        _self.lobby.remove_game(this);
    });

    // Start the game if we have all the players
    if (this.players.length === this.max_players) {

        this.game_full = true;

        // Begin the game
        this.broadcast('game_start', {});
        //this.broadcast_gamestate();

        //  Create the board and send it to the clients
        this.broadcast('build_board', this.buildBoard());
        //this.broadcast_gamestate();

        logger.log('debug', 'start the placement sequence.');
        this.startSequence()
    }

    // Notify the other players that a new player has joined
    /*
    this.broadcast('player_joined', {
        player_count    : this.players.length,
        max_players     : this.max_players
    });
*/

    // Temporary events to mimic game flow
    player.socket.on('place_settlement', function() {
        this.turn_update();
    });

    
    console.log('Player number ' + (this.players.length) + ' has been added');
    return true;
};

/**
 *
 */

/**
 * Handles an update event from the game
 */
Game.prototype.turn_update = function(data) {
    this.players[this.setupSequence[this.setupPointer]].turn_complete = true;
    this.players[this.setupSequence[this.setupPointer]].points ++;

    // Determine if the round is complete, ie. all players have
    // indicated their round is complete
    var round_complete = this.players.every(function(player) {
        return player.turn_complete === true;
    });

    // setupComplete flag false so that one player can place a settlement per turn in setup phase
    if (round_complete || !setupComplete) {
        this.process_round();
    }

    this.broadcast_gamestate();

    if(!this.setupComplete){
        logger.log('debug', 'Player '+data.player_id+' has tried to place a settlement.');

        //call start sequence again from here - startSequence will find the next player to have a turn
        this.startSequence();
    }
};

/**
 * Start Sequence
 */
Game.prototype.startSequence = function(){
    logger.log('debug', 'startSequence function called.');

    //create data_package

    if(this.setupPointer < this.setupSequence.length){
        console.log("broadcast to all to hide wait");

         // Notify current player that it is their turn
         // All others are asked to wait
        for (var i=0; i<this.players.length; i++) {
            var player = this.players[i];
            if (player.id == this.setupSequence[this.setupPointer]) {
                player.socket.emit('game_turn',[true,true]);
            } else {
                player.socket.emit('game_turn',[false,false]);
            }
        }

        //this.players[this.setupSequence[this.setupPointer]].socket.emit('game_turn',[true,true]); //TODO: change emit to standard
        //this.setupPointer++;
    }else{
        this.setupComplete = true;
    }
}


/**
 * Game logic
 */
Game.prototype.process_round = function()
{
    // For now: increment round number and reset the player turn
    // completion status
    this.players.forEach(function(player) {
        player.turn_complete = false;
    });

    this.round_num = this.round_num + 1;
}

/**
 * Gathers up the state of the game and sends the current gamestate
 * to all the players contains all data to render the current state
 * of the game in the browser
 */
Game.prototype.broadcast_gamestate = function() {

    var players = this.players.map(function(player, idx) {
        return {
            id              : idx,
            name            : player.name,
            turn_complete   : player.turn_complete,
            points          : 0
        };
    });

    var game_data = {
        players   : players,
        round_num : this.round_num
    };

    this.broadcast('update_game', game_data);
};

/**
 * Messages all players in the game
 */
Game.prototype.broadcast = function(event_name, data) {

    console.log('Broadcasting event: ' + event_name);
    this.players.forEach(function(player) {
        player.socket.emit(event_name, data);
    });
};

/**
 * Creates the initial board data and sends it to each client
 */
Game.prototype.buildBoard = function () {
    //  Create the play area
    this.board.build_nodes();
    //console.log("Tiles\n--------------------\n", gameData.tiles);
    console.log("Total Nodes =", this.board.nodes.length,"\n--------------------\n");
    for (var node of this.board.nodes) {
        console.log(node);
    }
    //console.log("Roads\n--------------------\n", gameData.roads);
    jsonData = JSON.stringify(this.board);

    return jsonData;
}

/*
 * Rolling two dices, and return the sum of the two dices number.
 */
Game.prototype.rollingDice=function () {
    var dice1=Math.ceil(Math.random() * 6 );
    var dice2=Math.ceil(Math.random() * 6 );
    return dice1+dice2;
}

module.exports = Game;
