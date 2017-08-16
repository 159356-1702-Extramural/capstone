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

    //score recorded as [(int)Total Points, (int)Victory Points, (bool)Longest Road, (bool)Largest Army]
    this.score          = [];

    //populate with data_api/cards object
    this.cards          = null;

    // Players colour
    this.colour         = null;
}

module.exports = Player;