var logger = require('winston');

var Game    = require('./game.js');
var Player  = require('../data_api/player.js');

function Lobby()
{
    this.games = [];
}

/**
 * Finds a game adds a user to it, create new game instances 
 * as needed
 * 
 * @param {obj} socket 
 * @param {obj} data 
 */
Lobby.prototype.assign_player = function(socket, data) {
    var player = new Player(socket, data);

    // Create a new game instance if we dont have available to put this player into
    if (this.games.length === 0 || this.games[this.games.length - 1].game_full) {
        console.log('Creating an new game');
        this.add_game();
    }

    console.log('Number of games = ' + this.games.length);
    this.games[this.games.length - 1].add_player(player);
};

/**
 *  Removes a game instance from the active games
 * @param {obj} data
 */
Lobby.prototype.remove_game = function(game) {
    var idx = this.games.indexOf(game);
    this.games.splice(idx, 1);
};

/**
 * Adds a new game to the Lobby
 * @param {obj} Game object
 */
Lobby.prototype.add_game = function() {
    this.games.push(new Game(this));
};


/**
 * Resets all the games - use for debugging
 */
Lobby.prototype.reset_game = function() {
    this.games = [];
    console.log('Games have been reset.');
};

module.exports = Lobby;