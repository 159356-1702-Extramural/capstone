var logger = require('winston');
var {_cards, _tradeCards} = require('../../public/data_api/cards.js');

/**
 * Instance of a player
 *
 * @param {any} socket
 * @param {any} data
 */
function Player(socket, data) {
  this.id = null;
  this.name = data ? data.name : null;
  this.game_id = data ? data.game_id : null;
  this.game_name = data ? data.game_name : null;
  this.socket = socket ? socket : null;
  this.winner = false;
  this.connected = true;

  this.turn_complete = false;
  //hold on to turn data : null was causing errors with .length
  this.turn_data = [];
  this.colour = null;
  this.used_dev_card = false;
  this.recent_purchases = [];

  this.score = {
    total_points: 0,
    victory_points: 0,
    road_length: 0,
    settlements: 0,
    cities: 0,
    longest_road: false,
    largest_army: false
  };

  this.actions = [];
  this.cards = new _cards();
  // required for tracking during and after rounds
  this.inter_trade = {
    wants_trade: false,
    trade_cards: new _tradeCards(),
    wants_cards: new _tradeCards()
  };
  this.round_distribution_cards = new _cards();

  this.trading = {
    sheep: false,
    ore: false,
    lumber: false,
    brick: false,
    grain: false,
    three: false
  };
}

Player.prototype.reset_inter_trade = function() {
  this.inter_trade.wants_trade = false;
  this.inter_trade.trade_cards = new _tradeCards();
  this.inter_trade.wants_cards = new _tradeCards();
};

module.exports = Player;
