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

    // action information that needs to be returned to the client
    this.actions        = []
;}


Player.prototype.add_action = function (action) {
    this.actions.push(action);
}

Player.prototype.clear_actions = function () {
    this.actions = [];
}

module.exports = Player;