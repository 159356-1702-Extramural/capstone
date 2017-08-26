var logger          = require('winston');
var board_builder   = require('./board_builder.js');

function Game(state_machine) {
    this.state_machine  = state_machine;
    this.board          = board_builder.generate();

    this.max_players    = 2;
    this.players        = [];

    this.round_num      = 1;

    this.player_colours = ['purple', 'red', 'blue', 'green'];

    this.development_cards = [];

    this.dice_roll      = [];
}

/**
* Returns bool if the game contains max players
* @return {Bool} (this.players.length === this.max_players)
*/
Game.prototype.game_full = function() {
    return (this.players.length === this.max_players);
};

/**
* Add the player object to this game
* @param {Player} player
* @return {Bool} - true if successful
*/
Game.prototype.add_player = function(player) {
    console.log('adding player');
    // Store the player id
    player.id = this.players.length;
    // Assign a color to this player
    player.colour = this.player_colours[player.id];
    //  Send the player details
    player.socket.emit('player_id', { name : player.name, id : player.id, colour : player.colour });
    // Add player to the game
    this.players.push(player);
    console.log('Player number ' + (this.players.length) + ' has been added');
    return true;
};

/**
* Parse the board to JSON string
* @return {String} JSON - this.board parsed to a JSON string
*/
Game.prototype.buildBoard = function () {
    jsonData = JSON.stringify(this.board);
    return jsonData;
};

/**
 *  Alocate starting resources based on the second settlement placement
 *  @param player : player object
 *  @param data   : Data package item
 */
Game.prototype.secondRoundResources = function(player, data) {
  var tiles;
  var i;
  var res_type;

  // find the settlement action
  for (i = 0; i < data.actions.length; i++) {

    if (data.actions[i].action_type === 'build_settlement') {
      tiles = data.actions[i].action_data.n_tiles;
    }
  }

  // Loop over each point and give the player one resource of each type
  if (typeof tiles !== 'undefined') {
      for (i = 0; i < tiles.length; i++) {
        res_type = this.board.get_tile_resource_type(tiles[i]);
        player.cards.add_card(res_type);
      }
  } else {
      console.log("secondRoundResources(): tiles undefined, possible invalid data");
      logger.log('debug', "secondRoundResources(): tiles undefined, possible invalid data");
  }
};


/**
 * Rolling two dices, and return the sum of the two dices number.
 * @return {Number} sum of the two dice
 */
Game.prototype.rollingDice = function() {
  var dice1 = Math.ceil(Math.random() * 6);
  var dice2 = Math.ceil(Math.random() * 6);

  // Store the individual dice rolls for diplsay in reound completion
  // modal when the next turn starts
  this.dice_roll = [dice1, dice2];

  return dice1 + dice2;
};

/**
 * Allocate Diceroll Resources
 * @param roll {numner} : between 2 and 12
 * @return void
 */
Game.prototype.allocateDicerollResources = function(roll) {
  var i;
  var j;
  var k;
  var n;

  // Robber no resources to allocate
  if (roll === 7) return;

  var tiles = this.board.tiles;

  for (i = 0; i < tiles.length; i++) {

    var tiles_row = tiles[i];

    for (n = 0; n < tiles_row.length; n++) {

      // Robbed!! No resources for you
      if (tiles_row[n].robber) continue;

      // Find tile with token matching diceroll
      if (tiles_row[n].token == roll) {

        // Check the associated notes for structures
        var associated_nodes = tiles_row[n].associated_nodes;


        for (j = 0; j < associated_nodes.length; j++) {

          var node = this.board.nodes[associated_nodes[j]];

          // If we find build hand over resource cards to that player
          if (node.building !== '') {

            var player_id = node.owner;

            // settlements get 1 resource, cities 2
            var num_resources = (node.building === 'house') ? 1 : 2;
            var resource = tiles_row[n].type;

            // Send the tile resources to the player
            for (k = 0; k < num_resources; k++) {
              this.players[player_id].cards.add_card(resource);
              this.players[player_id].round_distribution_cards.add_card(resource);
            }

          }
        }
      }

    }
  }

};

// return a shuffled development card deck
Game.prototype.generate_dev_card_deck = function(){

  /**
   * create a way to generate / return cards
   * 14 Knights
   *  6 Progress cards
   *      + Road Building x 2
   *      + Year of Plenty x 2
   *      + Monopoly x 2
   *  5 Victory Point Cards
   *      + Library
   *      + Chapel
   *      + Governors House
   *      + University of Catan
   *      + Market
   */
  var dev_cards = [];
  for(var i = 0; i < 14; i++){
    dev_cards.push('knight');
  }
  var other_cards = ['road_building', 'year_of_plenty', 'monopoly', 'library', 'chapel', 'governors_house', 'universtiy_of_catan', 'market'];
  for(var j = 0; j < other_cards.length; j++){
    
    //add the first three options twice
    if(j < 3){
      dev_cards.push(other_cards[j]);
    }
    dev_cards.push(other_cards[j]);
  }

  //  Alternate strategy
  //try to have a mixed start point to shuffle from
  // dev_cards.push('knight');
  // var other_cards = ['road_building', 'year_of_plenty', 'monopoly', 'library', 'chapel', 'palace', 'universtiy', 'market'];
  // for(var j = 0; j < other_cards.length; j++){
    
  //   //add the first three options twice
  //   if(j < 3){
  //     dev_cards.push('knight');
  //     dev_cards.push(other_cards[j]);
  //   }
  //   dev_cards.push('knight');
  //   dev_cards.push(other_cards[j]);
  // }
  // dev_cards.push('knight');
  // dev_cards.push('knight');
  
  return Fisher_Yates_shuffle(dev_cards);
}

function Fisher_Yates_shuffle (array) {
  var i = 0;
  var j = 0;
  var temp = null;

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array;
}
module.exports = Game;
