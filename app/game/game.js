var logger          = require('winston');
var board_builder   = require('./board_builder.js');
var Shuffler        = require('../helpers/shuffler.js');

function Game(state_machine) {
    this.state_machine  = state_machine;
    this.board          = board_builder.generate();

    this.max_players    = this.set_player_number();
    this.WIN_SCORE      = 10;

    this.players        = [];
    this.round_num      = 1;

    this.longest_road = 0;
    this.longest_road_id = -1;

    this.player_colours = ['purple', 'red', 'blue', 'green'];
    this.dice_roll      = [];

    // Holds id of player with monopoly (-1 for no one holding card);
    this.monopoly       = -1;

    // Indicates if a player has played the knight this round
    this.knight_player_id = -1;

    // set these variables via environment varaibles
    this.test_mode      = 'false';
    this.robber         = 'enabled';
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
  // TODO: test with invalid data
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

  // create fixed dice roll for testing -> constantly goes through dice values 5,6,7,8,9,10
  if(this.test_mode === 'true'){
    console.log("Fixed dice rolls enabled");
    logger.log("Fixed dice rolls enabled");
    var dice1array = [1,2,3,4,5,6];
    dice1 = dice1array[this.round_num % dice1array.length];

    //to stop 7 being the first number and causing infinite loop
    if(this.round_num === 2){
      dice1 = 4;
    }
    dice2 = 4;

    this.dice_roll = [dice1, dice2];
  }


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
            var num_resources = (node.building === 'settlement') ? 1 : 2;
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
   *      + Great Hall
   *      + University of Catan
   *      + Market
   */
  var dev_cards = [];
  for(var i = 0; i < 14; i++){
    dev_cards.push('knight');
  }
  var other_cards = ['year_of_plenty', 'road_building', 'monopoly', 'library', 'chapel', 'great_hall', 'universtiy_of_catan', 'market'];
  for(var j = 0; j < other_cards.length; j++){

    //add the first option twice (ignoring road_building and monopoly duplicates for now)
    if(j < 1){
      dev_cards.push(other_cards[j]);
    }
    dev_cards.push(other_cards[j]);
  }

  var shuffler = new Shuffler();
  return shuffler.shuffle(dev_cards);
};

/**
 * Steal resources from each player
 * @return void
 */
Game.prototype.robPlayers = function() {

  var i;
  var j;
  var player;
  var num_cards;

  var player_cards;
  var num_to_steal;

  var resource;

  var shuffler = new Shuffler();

  // Work out what happens to each player
  for (i = 0; i < this.players.length; i++) {
    player = this.players[i];

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
        if (player.cards.resource_cards.hasOwnProperty(resource)) {
          var resource_count = player.cards.resource_cards[resource];
          for (j = 0; j < resource_count; j++) {
            player_cards.push(resource);
          }
        }
      }

      // Randomise the cards then start robbing...
      player_cards = shuffler.shuffle(player_cards);

      for (j = 0; j < num_to_steal; j++) {
        player.cards.remove_card(player_cards[j]);
        player.round_distribution_cards.resource_cards[player_cards[j]]--;
      }
    }
  }
};

/**
 * Moves the robber to a new location
 * @return void
 */
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

/**
 * Moves the robber after the knight card has been played
 * @param {Number} player_id : id of the player playing the knight
 */
Game.prototype.knightMoveRobber = function(player_id) {

  var can_use;
  var new_robber_tile;
  var possibleLocations = [];
  var resourceTiles = this.board.resourceTiles;

  // Remove the robber from current location
  this.board.robberLocation.robber = false;

  // Find possible locations that we could move the robber to
  for (var i = 0; i < resourceTiles.length; i++) {
    can_use = true;
    for (var j = 0; j < resourceTiles[i].associated_nodes.length; j++) {
      // We can't block the player that played the knight
      if (resourceTiles[i].associated_nodes[j].owner === player_id) {
        can_use = false;
        break;
      }
    }

    // Robber can't stay in the same place
    if (resourceTiles[i].robber) {
      can_use = false;
    }

    // If this is a tile we can rob add to array to pick from
    if (can_use) {
      possibleLocations.push(resourceTiles[i]);
    }
  }

  // Randomly pick a new home for the robber
  new_robber_tile = possibleLocations[Math.floor(Math.random() * possibleLocations.length)];
  new_robber_tile.robber = true;

  // Store reference to the new home of the robber
  this.board.robberLocation = new_robber_tile;

};


/**
 * Determines the player scores
 * @return void
 */
Game.prototype.calculateScores = function() {

  // Reset the score since we're recalculating it
  this.players.forEach(function (player) {
    player.score.total_points = 0;
  }, this);

  // Count the buildings score
  this.board.nodes.forEach(function(node) {
    if (node.owner > -1) {
      // Score 1 point for each stellement and 2 points for each city
      this.players[node.owner].score.total_points += (node.building === 'settlement') ? 1 : 2;
    }
  }, this);

  // Count VP Cards and Longest Rd, Biggest Army
  // Find each players longest road
  var longest_road_map = this.board.longest_roads(this.players);
  var last_longest = this.longest_road;
  var last_player = this.longest_road_id;
  // find actual longest road
  for (var p=0; p<this.players.length; p++) {
    var player = this.players[p];
    // update the players data
    player.score.road_length = longest_road_map.get(player.id);
    // only change game data IF a new longest road is found
    // is changed to first found longest road only.
    if (player.score.road_length > this.longest_road) {
      this.longest_road_id = player.id;
      this.longest_road = player.score.road_length;
    }
  }

  // figure out if two players have the same length road on this turn
  // and skip road score update if true, and reset game data for longest
  var skip_update = false;
  for (var p=0; p<this.players.length; p++) {
    var player = this.players[p];
    if (player.score.road_length === this.longest_road && player.id !== this.longest_road_id) {
      skip_update = true;
      this.longest_road = last_longest;
      this.longest_road_id = last_player;
      console.log("Players", player.id, "and", this.longest_road_id, "have same length longest road");
      console.log("Longest Road bonus unchanged");
      break;
    }
  }

  if (skip_update === false) {
    for (var p=0; p<this.players.length; p++) {
      var player = this.players[p];
      if (this.longest_road >= 5) {
        player.score.longest_road =
            (this.longest_road_id === player.id) ? true : false;
      }
    }
  }

  this.players.forEach(function(player) {
    player.score.victory_points = player.cards.count_victory_cards();
    player.score.total_points += (player.score.longest_road === true) ? 2 : 0;
    player.score.total_points += (player.score.largest_army) ? 2 : 0;
    player.score.total_points += player.score.victory_points;
  });

};

/**
 * Check if we have a winner
 * @return {Boolean}
 */
Game.prototype.haveWinner = function() {

  var winners = [];
  var highest_score = 0;

  this.players.forEach(function(player) {

    if (player.score.total_points >= this.WIN_SCORE) {

      if (player.score.total_points < highest_score) return;
      if (player.score.total_points > highest_score) winners = [];

      winners.push(player);
    }

  }, this);

  if (winners.length === 1) {
    // Toggle the winner flag for this player
    winners[0].winner = true;
    return true;
  }

  // None or more than one winner - we keep going...
  return false;
};

/**
 * Return a dev card to the pack after it has been used
 * @param {String} card : knight, monopoly, road_building, year_of_plenty
 */
Game.prototype.return_dev_card = function(card){
  this.state_machine.development_cards.push(card);
}

/**
 * Check whether 4 player tests are required and set max players and setupSequence
 * @return {int} number of players : currently 2 or 4
 */

Game.prototype.set_player_number = function (){
  var player_num = process.env['players'];
  if(typeof player_num === 'undefined'){player_num = 2;}
  if(parseInt(player_num) === 4){
    this.state_machine.setupSequence = [0,1,2,3,3,2,1,0];
    this.state_machine.setupSequence = this.randomise_startup_array(4);
    return 4;
  }
  return 2;
}

/**
 * @param {int} number_of_players : integer with the number of players in the game
 * @return {Array} : Array holding a shuffled first round order and a mirrored second round
 *                      i.e [1,2,3,0,0,3,2,1]
 */
Game.prototype.randomise_startup_array = function (number_of_players){
  var shuffler = new Shuffler()
  var straight_array = [];
  //Create the first half of the array
  for ( var i = 0; i < number_of_players; i++){
    straight_array.push(i);
  }

  // Shuffle the first half
  var shuffled_array = shuffler.shuffle(straight_array);

  // add in the mirrored second half
  for (var j = 0; j < number_of_players; j++){
    shuffled_array.push(shuffled_array[j]);
  }
  return shuffled_array;
}

module.exports = Game;
