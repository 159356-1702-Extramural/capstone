var logger = require('winston');
//var board = require('./board.js');
var Data_package= require('../communal/data_package.js');
var board_builder = require('./board_builder.js');

function Game(state_machine) {
    this.state_machine  = state_machine;
    this.board          = board_builder.generate();

    this.max_players    = 2;
    this.players        = [];

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

///
Game.prototype.game_full = function() {
    return (this.players.length === this.max_players);
}

/// Adds a player to the game
Game.prototype.add_player = function(player) {
    console.log('adding player');
    // Add player to the game
    this.players.push(player);
    // Store the player id
    player.id = this.players.indexOf(player);
    // Assign a color to this player
    player.colour = this.player_colours[player.id];
    console.log('Player number ' + (this.players.length) + ' has been added');
    return true;
};

/**
 * Handles an update event from the game
 */
Game.prototype.turn_update = function(data) {
    this.players[data.player_id].turn_complete = true;

    // Determine if the round is complete, ie. all players have
    // indicated their round is complete
    var round_complete = this.players.every(function(player) {
        return player.turn_complete === true;
    });

    // setupComplete flag false so that one player can place a settlement per turn in setup phase
    if (round_complete || !setupComplete) {
        this.process_round();
    }

    //this.broadcast_gamestate();

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

         //tell player it is his / her turn

        this.players[this.setupSequence[this.setupPointer]].socket.emit('game_turn',[true,true]); //TODO: change emit to standard
        this.setupPointer++;
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
 * Creates the initial board data and sends it to each client
 */
Game.prototype.buildBoard = function () {
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
