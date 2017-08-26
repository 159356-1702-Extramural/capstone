var logger          = require('winston');
var board_builder   = require('./board_builder.js');
var Shuffler        = require('../helpers/shuffler.js');

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

/**
 * Steal resources from each player
 * @return void
 */
Game.prototype.robPlayers = function() {

  var i;
  var player;
  var num_cards;

  var player_cards;
  var num_to_steal;

  var resource;

  var shuffler = new Shuffler();

  // Work out what happens to each player
  for (i = 0; i < this.players.length; i++) {
    player = this.player[i];

    num_cards = player.cards.count_cards();

    // Work out how many cards to steal
    if (num_cards > 7) {
      // if players have > 7 cards steal half their cards,
      // in players favour if odd number of cards
      num_to_steal = Math.floor(num_cards/2);
    } else if (num_cards > 0) {
      // if players have <= 7 cards steal one random resource
      num_to_steal = 1;
    } else {
      // No cards for the robber to steal!. Well played Sir.
      num_to_steal = 0;
    }

    // If we're stealng some cards create an array of cards,
    // shuffle it then do the robbing
    if (num_to_steal > 0) {
      player_cards = [];

      for (resource in player.cards.resource_cards) {
        if (!player.cards.resource_cards.hasOwnProperty(resource)) {
          var resource_count = player.cards.resource_cards[resource];
          for (i = 0; i < resource_count; i++) {
            player_cards.push(resource);
          }
        }
      }

      player_cards = shuffler.shuffle(player_cards);

      for (i = 0; i < num_to_steal; i++) {
        player.cards.remove_card(player_cards[i]);
        player.cards.round_distribution_cards.add_card(resource);
      }
    }

  }
};

Game.prototype.moveRobber = function() {

  var new_robber_tile;

  // Remove the robber from current location
  this.board.robberLocation.robber = false;

  // Find a random resource tile for the robber, make sure the robber
  // goes to a new location
  do {
    new_robber_tile = this.board.resourceTiles[Math.floor(Math.random() * this.board.resourceTiles.length)];
  } while (new_robber_tile == this.board.robberLocation);

  new_robber_tile.robber = true;

  // Store reference to the new home of the robber
  this.board.robberLocation = new_robber_tile;
};


module.exports = Game;
