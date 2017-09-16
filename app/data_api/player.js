var logger = require('winston');

var Cards = require('../../public/data_api/cards.js');

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

    // True when player has won the game
    this.winner         = false;

    this.turn_complete  = false;
    //hold on to turn data : null was causing errors with .length
    this.turn_data      = [];

    // Players colour
    this.colour         = null;

    this.score          = {
      total_points   : 0,
      victory_points : 0,
      longest_road   : false,
      largest_army   : false
    };

    this.actions        = [];
    this.cards          = new Cards();
    this.round_distribution_cards = new Cards();

}

module.exports = Player;