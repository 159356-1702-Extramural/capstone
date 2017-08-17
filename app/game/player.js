var logger = require('winston');

/**
 * Instance of a player
 * 
 * @param {any} socket 
 * @param {any} data 
 */
function Player(socket, data) {
    this.id             = null;
    this.name           = data.name;
    this.socket         = socket;
    this.turn_complete  = false;

    // Players colour
    this.colour         = null;

    this.points         = 0;
}

module.exports = Player;