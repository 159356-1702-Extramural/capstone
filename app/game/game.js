var logger          = require('winston');

var board_builder   = require('./board_builder.js');

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
 * Creates the initial board data and sends it to each client
 */
Game.prototype.buildBoard = function () {
    jsonData = JSON.stringify(this.board);
    return jsonData;
}

module.exports = Game;
