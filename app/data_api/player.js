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
    //hold on to turn data
    this.turn_data      = null;

    // Players colour
    this.colour         = null;

    this.score         = [];
    this.actions    = null;
    this.cards      = null;
}

module.exports = Player;