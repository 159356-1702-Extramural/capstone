var Game    = require('./game.js');
var Player  = require('./player.js');

function Lobby()
{
    // TODO: allow multiple game instances
    this.game = new Game();
}

/**
 * Finds a game adds a user to it
 * @param {obj} socket 
 * @param {obj} data 
 */
Lobby.prototype.assign_player = function(socket, data) {
    var player = new Player(socket, data);

    // TODO: multiple game instances?
    if (!this.game.add_player(player)) {
        socket.emit('game-error', { 
            message : 'Unable to add you to a game'
        });
    }
};

/**
 * Resets the game - use for debugging
 */
Lobby.prototype.reset_game = function() {
    this.game = new Game();
    console.log('Game has been reset.');
};

module.exports = Lobby;