// TODO: remove console.log lines
/*
 * The state_machine is the core of the server side for each game.
 *
 * Upon first player joining the server, on state_machine is created
 * with one Game object, players are added to the Game until it is full
 * and then the state_machine starts, iterating through each valid state.
 *
 * The tasks of the state_machine include:
 *   + game logic per state
 *   + broadcasting to players per state requirements
 *   + management and resolution of incoming player actions
 *   + evaluating state conditions, and switching states as required
 *
 * For each full game, a new state_machine is created.
 */
var util = require('util');
var logger = require('winston');
var Game = require('./game.js');
var Data_package = require('../data_api/data_package.js');
var Game_state = require('../data_api/game_state.js');
var Action = require('../../public/data_api/action.js');
var {
  Cards,
  TradeCards
} = require('../../public/data_api/cards.js');

/*
 * The state machine contains the Game and operates on it per current state logic
 * @param {Integer} id
 */
function StateMachine(id, game_size) {
  this.id = id;
  this.game = new Game();
  this.game.max_players = game_size;
  this.state = "setup"; // starting state, states are ref by string for readability
  this.setupComplete = false;
  this.setupSequence = [];
  this.setupPointer = 0;
  this.chat = null;
  this.timer = null;
  this.timer_length = 666; // seconds

}

StateMachine.prototype.log = function (level, info) {
  if (typeof info === "object" && level === "debug") {
    logger.log(level, 'SM#' + this.id + ': object data =');
    console.log(info);
  } else {
    logger.log(level, 'SM#' + this.id + ': ', info);
  }
}
/*
 * Iterates through states according to flags set
 * for example; setup_complete = true would skip that state
 * or a return of false on check_win_condition() would skip the
 * game_end state
 */
StateMachine.prototype.next_state = function () {
  // TODO: checks on game conditions to determine state
  if (this.state === "setup") {
    this.log('debug', 'in "setup" state');
    // if (conditions to switch state)
    if (this.setupComplete === true) {
      this.log('debug', 'setup state successfully completed');
      //start timer for first round
      this.start_timer();
      this.state = "play";
    }
  } else if (this.state === "play") {
    this.log('debug', 'in "play" state');
    // End the game if we have a winner
    if (this.game.haveWinner()) {
      this.state = "end_game";
    }
  } else if (this.state === "end_game") {
    this.log('debug', 'in "end_game" state');
    // if (conditions to switch state)
  }
};

/***************************************************************
 * This is where the actual state logic lives
 *
 * NOTE: For each incoming player request, this ticks over
 *       which means that tracking how many player requests have
 *       come in is of use per state
 ****************************************************************/
StateMachine.prototype.tick = function (data) {
  this.log('debug', 'round #' + this.game.round_num);
  /************************************************************
   * If in Setup state - game setup logic operates on this.game
   ************************************************************/
  if (this.state === "setup" && data) {
    this.log('debug', '\n   ' + this.game.players[data.player_id].name + ' initiated tick()');
    //  Set the piece
    this.validate_player_builds(data);

    //  Mark turn completed
    this.game.players[data.player_id].turn_complete = true;
    this.game.players[data.player_id].turn_data = data;
    //logger.log('debug', 'Player '+data.player_id+' has tried to place a settlement.');
    //distribute resources from the second round settlement placement

    //second round resources was running 1 too many times so needed to add the extra check
    if (this.setupPointer > this.setupSequence.length / 2 && this.setupPointer <= this.setupSequence.length) {
      this.log('debug', "setupPointer: " + this.setupPointer + " | setupSeq ID: " + this.setupSequence[this
          .setupPointer] +
        "| data.player_id: " + data.player_id);
      this.game.secondRoundResources(this.game.players[data.player_id], data);
    }

    // increment round number once
    if (this.setupPointer === this.setupSequence.length / 2)
      this.game.round_num++;

    if (this.setupPointer === this.setupSequence.length) {
      this.log('info', "final player setup");
      var diceroll;
      // We can't start with a 7 as that would mean starting with robber
      do {
        diceroll = this.game.rollingDice();
      } while (diceroll === 7);
      this.game.allocateDicerollResources(diceroll);

      // Calculate the scores
      this.game.calculateScores();
      this.game.round_num++;

      //  Notify each player
      var setup_data = new Data_package();
      setup_data.data_type = 'round_turn';
      this.broadcast('game_turn', setup_data);
    }

    this.broadcast_gamestate();
    this.game_start_sequence();
    // reset the player turn completion status
    this.game.reset_player_turns();
    this.next_state();
    return true;
  }

  /************************************************************
   * If in Play state - gameplay logic opperates on this.game
   ************************************************************/
  else if (this.state === "play" && data) {
    let player_name = this.game.players[data.player_id].name;
    let turn_complete = this.game.players[data.player_id].turn_complete;
    this.log('debug', 'ticked play state : initiated by ' + player_name);
    this.log('info', "Requested action is " + data.data_type);
    //  Validate each player action
    // trading with the bank (4:1, 3:1, 2:1)
    switch (data.data_type) {
    case 'still_connected':
      this.game.players[data.player_id].connected = true;
      this.game.players[data.player_id].used_dev_card = false;
      this.game.players[data.player_id].recent_purchases =[];
      break;
    case 'trade_with_bank':
      if (!turn_complete)
        this.trade_with_bank(data);
      break;
    case 'init_player_trade':
      if (!turn_complete)
        this.init_player_trade(data);
      break;
    case 'accept_player_trade':
      this.accept_player_trade(data);
      break;
    case 'cancel_player_trade':
      if (!turn_complete)
        this.cancel_player_trade(data);
      break;
    case 'buy_dev_card':
      if (!turn_complete)
        this.buy_dev_card(data);
      break;
    case 'request_knight':
      // Player has indicated they're going to use knight
      // disable the knight for all other players
      if (!turn_complete)
        this.knightRequest(data);
      break;
    case 'move_knight_to':
      if (!turn_complete)
        this.move_knight_to(data);
      break;
      // fall through to catch all dev card uses
    case 'use_knight':
    case 'year_of_plenty_used':
    case 'road_building_used':
    case 'monopoly_used':
      if (!this.game.players[data.player_id].used_dev_card && !turn_complete) {
        var recent_purchases = this.game.players[data.player_id].recent_purchases;
        switch (data.data_type) {
        case 'use_knight':
          this.useKnight(data);
          // Add flag so we can notify other players knight has been played
          this.game.knight_player_id = data.player_id;
          break;
        case 'year_of_plenty_used':
          if (recent_purchases.indexOf('year_of_plenty') === -1) {
            this.log('debug', 'year of plenty played by ' + player_name);
            this.activate_year_of_plenty(data);
          } else {
            this.log('debug', player_name + " attempted to use Year of Plenty in same round as purchase");
          }
          break;
        case 'road_building_used':
          if (recent_purchases.indexOf('road_building') === -1) {
            this.log('debug', 'road building played by ' + player_name);
            this.activate_road_building(data);
          } else {
            this.log('debug', player_name + " attempted to use Road Building in same round as purchase");
          }
          break;
        case 'monopoly_used':
          this.game.monopoly = -1;
          this.activate_monopoly(data);
          break;
          // TODO: does monopoly block using other cards?
        }
        this.game.players[data.player_id].used_dev_card = true;
      } else {
        // send message saying Noooooo!
      }
      break;
    case 'monopoly_not_used':
      //ignore this if monopoly not in play
      if (this.game.monopoly === data.player_id && !turn_complete) {
        var data_package = new Data_package();
        data_package.data_type = "round_turn";
        // player with monopoly chose not to play it... tell all players to have their turn
        for (var i = 0; i < this.game.players.length; i++) {
          if (i !== this.game.monopoly) {
            data_package.player = this.game.players[i];
            this.send_to_player('game_turn', data_package);
          }
        }
      } else {
        this.log('debug', 'monopoly ignored');
      }
      break;
      // this section is activated when each player finishes their turn
    case 'turn_complete':
      // Handle standard gameplay rounds
      if (!turn_complete) {
        this.game.players[data.player_id].turn_complete = true;
        this.game.players[data.player_id].used_dev_card = false;
        this.game.players[data.player_id].recent_purchases = [];
        this.game.players[data.player_id].turn_data = data;
      }
      // Determine if all players have indicated their round is complete
      var round_complete = this.game.players.every(function (player) {
        return player.turn_complete === true;
      });

      if (round_complete) {
        this.finish_round_for_all(data);
      } else {
        //  Tell this player to wait and update the interface for all others
        var waiting = [];
        for (var i = 0; i < this.game.players.length; i++) {
          waiting.push([i, this.game.players[i].turn_complete]);
        }

        for (var i = 0; i < this.game.players.length; i++) {
          if (i == data.player_id) {
            var setup_data = new Data_package();
            setup_data.data_type = 'wait_others';
            this.game.players[data.player_id].socket.emit('game_turn', setup_data);
          } else {
            this.game.players[i].socket.emit('update_players_waiting', waiting);
          }
        }
      }
      break;
    }
    this.next_state();
    return true;
  }
  /************************************************************
   * If in end_game state - gameplay logic opperates on this.game
   ************************************************************/
  else if (this.state === "end_game" && data) {
    this.log('debug', 'ticked end_game state : initiated by ' + this.game.players[data.player_id].name);
    this.broadcast_gamestate();
    this.broadcast_end();
    this.next_state();
    return true;
  }
  this.next_state();
  this.log('error', "Game tick received no data");
  return false;
};

StateMachine.prototype.finish_round_for_all = function (data) {
  this.stop_timer();
  if (!data) this.log("error", "func 'finish_round_for_all()' missing data");
  this.validate_player_builds(data);
  this.game.round_num++;
  this.game.calculateScores();

  // Resource distribution for next round
  for (var i = 0; i < this.game.players.length; i++) {
    // Reset round distribution cards
    this.game.players[i].round_distribution_cards = new Cards();
    this.game.players[i].inter_trade.wants_trade = false;
    this.game.players[i].inter_trade.trade_cards = new TradeCards();
    this.game.players[i].inter_trade.wants_cards = new TradeCards();
  }
  // House rule 7 only comes up once someone has created their first non-startup building
  var player_has_built = false;
  for (var i = 0; i < this.game.players.length; i++) {
    if (this.game.players[i].score.settlements > 2) {
      player_has_built = true;
      break;
    }
  }

  //  Next dice roll
  var diceroll = 1;
  var diceroll_check = 1;
  do {
    diceroll = this.game.rollingDice();

    // House rule: no robber until first non-startup build
    if (diceroll == 7 && !player_has_built) {
      diceroll = 1;
    }

  } while (diceroll < 2);

  // disable the robber for testing
  if (this.game.robber === 'disabled' && diceroll === 7) {
    this.log('debug', "robber disabled, changing roll to 8");
    this.game.dice_roll = [4, 4];
    diceroll = 8;
  }

  if (diceroll !== 7) {
    this.game.allocateDicerollResources(diceroll);
  } else if (this.game.robber !== 'disabled') {
    this.game.robPlayers();
  }

  this.broadcast_gamestate();
  this.game.players.forEach(function (player) {
    player.turn_complete = false;
  });

  // Reset the played knight flag on the game
  this.game.knight_player_id = -1;

  var setup_data = new Data_package();
  setup_data.data_type = 'round_turn';

  //  Notify players if there is no monopoly in play
  if (this.game.monopoly < 0) {
    this.broadcast('game_turn', setup_data);
  } else {
    // if there is a monopoly in play, notify only that player to start their turn
    setup_data.player = this.game.players[this.game.monopoly];
    this.send_to_player('game_turn', setup_data);
    //tell the player who finished the round to wait (if they aren't the monopoly player)
    if (this.game.monopoly !== data.player_id) {
      setup_data.data_type = 'wait_others';
      this.game.players[data.player_id].socket.emit('game_turn', setup_data);
    }
  }
  this.start_timer();
};

/*****************************************************************
 Gathers up the state of the game and sends the current gamestate
 to all the players contains all data to render the current state
 of the game in the browser
******************************************************************/
StateMachine.prototype.broadcast_gamestate = function () {
  var player;
  var data_package;

  // Set up the game state
  var game_state = new Game_state();

  var players = this.game.players.map(function (player, idx) {
    return {
      id: idx,
      name: player.name,
      colour: player.colour,
      turn_complete: false,
      points: player.score.total_points - player.score.victory_points,
      victory_points: player.score.victory_points,
      victory_point_cards: player.cards.victory_point_cards,
      cards_count: player.cards.count_cards(),
      knight_played: player.cards.dev_cards.knight_played,
      dev_cards_count: player.cards.count_dev_cards(),
      vp_cards: [player.score.largest_army, player.score.longest_road]
    };
  });
  game_state.players = players;
  game_state.board = this.game.board;
  game_state.round_num = this.game.round_num;
  game_state.dice_values = this.game.dice_roll;
  game_state.knight_player_id = this.game.knight_player_id;
  // Send each player their a game update

  for (var i = 0; i < this.game.players.length; i++) {
    // Clone Player so we can remove the socket for transmission to client
    player = Object.assign({}, this.game.players[i]);
    delete player.socket;

    data_package = new Data_package();
    data_package.set_turn_type('update_board');
    data_package.set_player(player);
    data_package.set_game_state(game_state);
    this.send_to_player('update_game', data_package);
  }
};

/**
 * The game is over and we have a winner!
 */
StateMachine.prototype.broadcast_end = function () {
  var player;
  var end_game_data = {
    players: []
  };

  for (var i = 0; i < this.game.players.length; i++) {
    // Clone Player so we can remove the socket for transmission to client
    player = Object.assign({}, this.game.players[i]);
    delete player.socket;
    end_game_data.players.push(player);
    if (player.winner) {
      end_game_data.winners_id = player.id;
    }
  }
  this.broadcast('game_end', end_game_data);
};

/// Messages all players in a game
StateMachine.prototype.broadcast = function (event_name, data) {
  if (!data) this.log("error", "func 'broadcast()' missing data");
  this.log('debug', 'Broadcasting event: ' + event_name);
  
  for( var i = 0; i < this.game.players.length; i++){
    var player = this.game.players[i];
    if(player.connected){
      player.socket.emit(event_name, data);
    }else{
      if(data.data_type === 'round_turn'){
        this.run_computer_player(player.id);
      }
    }
  }
};

/// Messages individual player in a game
StateMachine.prototype.send_to_player = function (event_name, data) {
  if (!data) this.log("error", "func 'send_to_player()' missing data");
  var player = this.game.players[data.player.id];

  /**
   *  Check to see if there is a socket object in the data.player object.
   *  If so, clone the player, remove the socket and add the clone to data
   */
  var clonedPlayer;
  if (player.socket) {
    clonedPlayer = Object.assign({}, this.game.players[data.player.id]);
    delete clonedPlayer.socket;
    data.player = clonedPlayer;
  }
  this.log('debug', event_name + ': sending to send data to player ' + data.player.id);
  this.log('debug', event_name + ': data follows:');
  if (data.turn_type !== 'update_board') // too big to print usually
    this.log('debug', data);
  player.socket.emit(event_name, data);
};
/***************************************************************
 * Start Sequence
 ***************************************************************/
StateMachine.prototype.game_start_sequence = function (initiatingGame) {
  this.log('debug', 'game_start_sequence function called.');
  //Create data package for setup phase
  var setup_data = new Data_package();
  setup_data.data_type = 'setup_phase';

  if (this.setupPointer < this.setupSequence.length) {
    // send all players except one a wait command
    for (var i = 0; i < this.game.players.length; i++) {
      if (i !== this.setupSequence[this.setupPointer]) {
        //not this player's turn to place a settlement and road
        setup_data.player = 0;
        this.log('debug', 'Send data for player #' + i + ' to wait');
        this.game.players[i].socket.emit('game_turn', setup_data);
      } else {
        //this player's turn to place a settlement and road (1=first place, 2 = 2nd placement)
        if (this.setupPointer < this.setupSequence.length / 2) {
          setup_data.player = 1;
        } else {
          setup_data.player = 2;
        }
        this.game.players[i].socket.emit('game_turn', setup_data);
      }
    }
  } else {
    this.setupComplete = true;
    this.log('debug', 'Setup phase completed');
    setup_data.data_type = 'setup_complete';
    this.broadcast('game_turn', setup_data);
    this.game.players.forEach(function (player) {
      player.turn_complete = false;
    });

  }

  //required because it increments pointer out of position before player starts
  this.setupPointer++;

};

/***************************************************************
 * Validate player builds/actions
 ***************************************************************/
StateMachine.prototype.validate_player_builds = function (data) {
  this.log('debug', 'validate_player_builds function called.');
  if (!data) this.log("error", "func 'validate_player_builds()' missing data");
  if (this.game.round_num < 3) {
    //  During the seutp, just set the piece
    for (var i = 0; i < data.actions.length; i++) {
      var player_id = data.player_id;
      var item = data.actions[i].action_type; //settlement or road
        this.log('debug', '----actions:'+item)


      var index = data.actions[i].action_data.id;
      this.log('debug','-------------actions:'+item+'---data:'+data.actions[i].action_data.id)
      this.game.board.set_item(item, index, player_id);
      data.actions[i].action_result = 0;

      //  Set harbor if needed
      this.set_harbor(i, data);
    }
  } else {
    //  Our first pass is to do a direct check for conflicts
    for (var p = 0; p < this.game.players.length; p++) {
      var data = this.game.players[p].turn_data;
      if (typeof data.actions === "undefined")
        break;
      for (var i = 0; i < data.actions.length; i++) {
        var player_id = data.player_id;
        var item = data.actions[i].action_type; //settlement or road
        var index = data.actions[i].action_data.id;
        var boost_cards = data.actions[i].boost_cards;

        //  Are there any others that have the same action/data.id
        //  wins_conflict will return one of the following:
        //  0 = Won!
        //  1 = Tie
        //  2 = Lost
        if (this.game.round_num > 2) {
          var won_conflict = this.wins_conflict(player_id, item, index, boost_cards);
          data.actions[i].action_result = won_conflict;
          if (won_conflict == 0) {
            this.game.board.set_item(item, index, player_id);
            //  Set harbor if needed
            this.set_harbor(i, data);
          }
        } else {
          data.actions[i].action_result = 0;
          this.game.board.set_item(item, index, player_id);

          //  Set harbor if needed
          this.set_harbor(i, data);
        }
      }
    }

    //  Now we do a 2nd pass to see if any failed settlements/roads caused any orphans
    for (var p = 0; p < this.game.players.length; p++) {
      var data = this.game.players[p].turn_data;
      if (typeof data.actions === "undefined")
        break;
      for (var i = 0; i < data.actions.length; i++) {
        if (data.actions[i].action_result == 0) {
          var object_type = data.actions[i].action_type.replace("build_", "");
          var node = (object_type == "road" ? this.game.board.roads[data.actions[i].action_data.id] : this.game
            .board.nodes[data.actions[i].action_data.id]);
          //  Do we have a path to a locked node/road
          if (!this.has_valid_path(this.game.players[p], object_type, node, node.id, "")) {
            data.actions[i].action_result = 2;
            this.game.board.clear_item(node.id, object_type);
          }

        }
      }
    }
    //  Finally, a pass to remove cards from successful builds
    for (var p = 0; p < this.game.players.length; p++) {
      var data = this.game.players[p].turn_data;
      if (typeof data.actions === "undefined")
        break;
      for (var a = 0; a < data.actions.length; a++) {
        if (data.actions[a].action_result == 0) {
          //  Remove the cards
          if (data.actions[a].boost_cards !== null) {
            this.game.players[p].cards.remove_boost_cards(data.actions[a].boost_cards);
          }
        }
      }
    }
  }
};

StateMachine.prototype.set_harbor = function (index, data) {
  if (data.actions[index].action_data.harbor) {
    if (data.actions[index].action_data.harbor.length > 0) {
      this.game.players[data.player_id].trading[data.actions[index].action_data.harbor] = true;
    }
  }
};

/***************************************************************
 * Determine if there is a conflict and who wins the conflict
 ***************************************************************/
StateMachine.prototype.wins_conflict = function (player_id, item, index, boost_cards) {
  for (var i = 0; i < this.game.players.length; i++) {
    //  Ignore this player
    if (this.game.players[i].id != player_id) {
      //  Loop through next player actions
      for (var j = 0; j < this.game.players[i].turn_data.actions.length; j++) {
        //  Building something in same spot?
        var actions = this.game.players[i].turn_data.actions[j];
        var conflict = (actions.action_type == item && actions.action_data.id == index);
        if (!conflict && item == "build_settlement") {
          //  If both players are building a settlement, check for adjacent
          for (var s = 0; s < this.game.board.nodes[index].n_nodes.length; s++) {
            if (actions.action_type == item &&
              this.game.board.nodes[index].n_nodes[s] == actions.action_data.id) {
              conflict = true;
              break;
            }
          }
        }
        if (conflict) {
          //  Conflict found
          //  Find the matching object for the current player being checked
          var current_player_action_index = -1;
          var current_player_actions = this.game.players[player_id].turn_data.actions;
          for (var k = 0; k < current_player_actions.length; k++) {
            if (current_player_actions[k].action_type == item &&
              this.game.players[player_id].turn_data.actions[k].action_data.id == index) {
              current_player_action_index = k;
              break;
            }
          }

          //  First check to see if main player used road building
          if (current_player_actions[current_player_action_index].boost_cards.length >
            0) {
            if (item == "build_road" &&
              current_player_actions[current_player_action_index].boost_cards[0] == "road_building") {
              return 0; //  Automatic win
            }
          }

          //  Then check to see if other player used road building
          if (actions.boost_cards.length > 0) {
            if (item == "build_road" && actions.boost_cards[0] ==
              "road_building") {
              return 2; //  Automatic Loss
            }
          }

          //  Compare # of boost cards
          var player_boost_card_count = 0;
          if (boost_cards) {
            player_boost_card_count = boost_cards.length;
          }
          var other_player_boost_card_count = 0;
          if (actions.boost_cards) {
            other_player_boost_card_count = actions.boost_cards.length;
          }

          if (player_boost_card_count == other_player_boost_card_count) {
            return 1; //  Tie
          }
          if (player_boost_card_count > other_player_boost_card_count) {
            return 0; //  Win
          }
          return 2; //  Lost
        }
      }
    }
  }
  return 0; //  Win
};

/***************************************************************
 * Check a road/settlement to see if it connects up with another from this player
 ***************************************************************/
StateMachine.prototype.has_valid_path = function (player, object_type, node, original_node, checked) {
  var has_path = false;
  //  Make sure we have not already checked this node/road
  if (checked.indexOf(object_type + ":" + node.id) > -1) {
    return has_path;
  }
  checked += object_type + ":" + node.id + ",";

  //  If this spot holds a locked node/road
  if (node.owner == player.id && node.id != original_node) {
    return true;
  }

  //  Otherwise we keep going
  if (object_type == "road") {
    //  No reason to be here if this is a road with no owner
    if (node.owner == -1) {
      return false;
    }
    //  Otherwise, check neighbor nodes
    for (var i = 0; i < node.connects.length; i++) {
      has_path = has_path || this.has_valid_path(player, "settlement", this.game.board.nodes[node.connects[
        i]], original_node, checked);
      if (has_path) {
        break;
      }
    }
  } else {
    //  If this is a settlement, and someone else owns it, we cannot continue on this path
    if (node.owner != player.id && node.owner > -1) {
      return false;
    }

    for (var i = 0; i < node.n_roads.length; i++) {
      has_path = has_path || this.has_valid_path(player, "road", this.game.board.roads[node.n_roads[i]],
        original_node, checked);
      if (has_path) {
        break;
      }
    }
    if (!has_path) {
      for (var i = 0; i < node.n_nodes.length; i++) {
        has_path = has_path || this.has_valid_path(player, "settlement", this.game.board.nodes[node.n_nodes[
          i]], original_node, checked);
        if (has_path) {
          break;
        }
      }
    }
  }
  return has_path;
};

StateMachine.prototype.trade_with_bank = function (data) {
  if (!data) this.log("error", "func 'trade_with_bank()' missing data");
  this.log('debug', "trade action with bank, player: " + this.game.players[data.player_id].name);

  //split the data to get the resource type: currently string = trade_sheep
  var cards_for_bank = data.actions[0].action_data.cards_for_the_bank.split('_');
  var cards_from_bank = data.actions[0].action_data.cards_from_the_bank.split('_');
  var cards_for_trade = data.actions[0].action_data.cards_for_trade;

  // check if cards available and remove cards from hand
  var data_package = new Data_package();
  if (this.game.players[data.player_id].cards.remove_multiple_cards(cards_for_bank[1], cards_for_trade)) {
    // add card to hand
    this.game.players[data.player_id].cards.add_card(cards_from_bank[1]);
    this.game.players[data.player_id].round_distribution_cards = new Cards();
    this.game.players[data.player_id].round_distribution_cards.add_card(cards_from_bank[1]);
    //send card back to player
    data_package.data_type = "returned_trade_card";
    data_package.player = this.game.players[data.player_id];
    this.send_to_player('game_turn', data_package);
  } else {
    //trade failed server side
    this.log("error", "Bank trade approved client side but failed server side.");

    data_package.player = this.game.players[data.player_id];
    data_package.data_type = "invalid_move";

    // return action to tell client failed reason
    var action = new Action();
    action.action_type = 'invalid_move';

    // Message to display at client end
    action.action_data = 'Your trade with the bank failed, you didn\'t have enough cards';
    data_package.player.actions = [];
    data_package.player.actions.push(action);

    this.send_to_player('game_turn', data_package);
    this.log('info', 'Trade with bank package sent');
  }
};

StateMachine.prototype.send_invalid_msg = function (player, data_type, msg) {
  var data_package = new Data_package();
  data_package.player = player;
  data_package.data_type = data_type;
  // return action to tell client failed reason
  var action = new Action();
  // Message to display at client end
  action.action_data = msg;
  data_package.player.actions = [];
  data_package.player.actions.push(action);
  this.send_to_player('game_turn', data_package);
};

// broadcast trade intent only
StateMachine.prototype.init_player_trade = function (data) {
  var player = this.game.players[data.player_id];

  if (player.inter_trade.wants_trade) {
    this.send_invalid_msg(player, 'invalid_move', 'You already have a trade open');
  }

  var trade_cards = new TradeCards(data.actions[0].action_data.trade_cards); // is a "TradeCards" object
  var wants_cards = new TradeCards(data.actions[0].action_data.wants_cards); // is a "TradeCards" object

  for (let card of Object.keys(trade_cards)) {
    if (player.cards.count_single_card(card) < trade_cards.get(card)) {
      this.log('info', 'player ' + player.name + ' attempted to trade without enough cards');
      this.send_invalid_msg(player, 'invalid_move',
        'Your trade attempt failed, you didn\'t have enough cards');
    }
  };
  player.inter_trade.wants_trade = true;
  player.inter_trade.trade_cards = trade_cards;
  player.inter_trade.wants_cards = wants_cards;

  this.log('info', 'player ' + player.name + ' wants to trade with others');
  var data_package = new Data_package();
  data_package.player_id = player.id;
  data_package.data_type = "player_trade";
  var action = new Action();
  action.action_data = data.actions[0].action_data; // copy over trade data
  data_package.actions = [];
  data_package.actions.push(action);
  this.broadcast('game_turn', data_package);
};

// remove cards only when trade is accepted
StateMachine.prototype.accept_player_trade = function (data) {
  var this_player = this.game.players[data.player_id];
  var other_player = this.game.players[data.actions[0].action_data.other_id];
  // try trading the cards
  var success = this.game.do_trade_with_other(this_player.id, other_player.id);

  if (success) {
    // send cards back to player
    var this_player_package = new Data_package();
    this_player_package.data_type = "returned_player_trade";
    this_player_package.player = this_player;
    this.send_to_player('game_turn', this_player_package);
    // and back to other player
    var other_player_package = new Data_package();
    other_player_package.data_type = "returned_player_trade";
    other_player_package.player = other_player;

    //  Build list of cards received
    var card_list = "Your trade was successful! You received ";
    card_list += (other_player.inter_trade.wants_cards.brick > 0 ? other_player.inter_trade.wants_cards.brick + " brick, " : "");
    card_list += (other_player.inter_trade.wants_cards.ore > 0 ? other_player.inter_trade.wants_cards.ore + " ore, " : "");
    card_list += (other_player.inter_trade.wants_cards.lumber > 0 ? other_player.inter_trade.wants_cards.lumber + " lumber, " : "");
    card_list += (other_player.inter_trade.wants_cards.grain > 0 ? other_player.inter_trade.wants_cards.grain + " grain, " : "");
    card_list += (other_player.inter_trade.wants_cards.sheep > 0 ? other_player.inter_trade.wants_cards.sheep + " sheep, " : "");
    other_player_package.message = card_list.substring(0, card_list.length - 2);
    this.send_to_player('game_turn', other_player_package);
  }
  else if (!success) {
    this.send_invalid_msg(other_player, 'invalid_move',
      'The trade attempt failed, the other player didn\'t have enough cards');
    this.send_invalid_msg(this_player, 'invalid_move',
      'The trade attempt failed, you didn\'t have enough cards');
  }
  // reset trade either way the status goes
  other_player.reset_inter_trade();

  this.log('info', 'updating all players with status of inter-player trade');
  var data_package = new Data_package();
  data_package.player_id = other_player.id;
  data_package.data_type = "player_trade";
  var action = new Action();
  action.action_data = other_player.inter_trade; // copy over trade data
  data_package.actions = [];
  data_package.actions.push(action);
  this.broadcast('game_turn', data_package);
};

StateMachine.prototype.cancel_player_trade = function (data) {
  var player = this.game.players[data.player_id];
  player.reset_inter_trade();

  var data_package = new Data_package();
  data_package.player_id = player.id;
  data_package.data_type = "cancel_player_trade";
  this.broadcast('game_turn', data_package);

  this.log('info', player.name + ' cancelled their trade offer')
};

StateMachine.prototype.buy_dev_card = function (data) {
  if (!data) this.log("error", "func 'buy_dev_card()' missing data");
  let player = this.game.players[data.player_id];
  if (this.game.cards.length >= 1) {
    //check if player has available cards
    if (player.cards.available_cards('dev_card')) {
      player.cards.remove_cards('dev_card');
      // changed to shift as cards[0] needs to be removed
      var card = this.game.cards.shift();
      this.log('debug', player.name + ' purchased ' + card);

      if (card === 'monopoly') {
        this.game.monopoly = data.player_id;
      }

      player.cards.add_card(card);
      player.recent_purchases.push(card);
      player.round_distribution_cards.add_card(card);
      this.log('debug', 'Round distribution cards =\n' + player.round_distribution_cards);

      var data_package = new Data_package();
      data_package.data_type = 'buy_dev_card';
      data_package.player = player;

      this.send_to_player('game_turn', data_package);
    } else {
      this.send_invalid_msg(player, 'invalid_move', "You don't have enough resources for a purchase");
    }
  } else {
    this.log('debug', player.name +
      ' does not have enough resources to buy a dev card');
    this.send_invalid_msg(player, 'invalid_move', 'There are no cards left to purchase');
  }
};

StateMachine.prototype.activate_year_of_plenty = function (data) {
  if (!data) this.log("error", "func 'activate_year_of_plenty()' missing data");
  //request sent immediately so action will always be first but check to be sure
  if (data.actions[0].action_type === 'year_of_plenty') {
    var requested_cards = data.actions[0].action_data;
    for (var i = 0; i < requested_cards.length; i++) {
      this.game.players[data.player_id].cards.add_card(requested_cards[i]);
      this.game.players[data.player_id].round_distribution_cards.add_card(requested_cards[i]);
    }

    if (this.game.players[data.player_id].cards.remove_card('year_of_plenty')) {
      this.log('info', "Removed 'Year of Plenty' card from", data.player_id);
    } else {
      this.log('error', "Failed to remove 'Year of Plenty' card from", data.player_id);
      return false;
    }
    //return the card to the pack
    this.game.return_dev_card('year_of_plenty');

    var data_package = new Data_package();
    data_package.data_type = 'return_year_of_plenty';
    data_package.player = this.game.players[data.player_id];

    this.send_to_player('game_turn', data_package);
  } else {
    this.log('error', "Year of plenty called but year of plenty action not visible");
  }
  return true;
};

StateMachine.prototype.activate_road_building = function (data) {
  if (!data) this.log("error", "func 'activate_road_building()' missing data");

  //request sent immediately so action will always be first but check to be sure
  if (data.actions[0].action_type === 'road_building') {
    var requested_cards = data.actions[0].action_data;
    for (var i = 0; i < requested_cards.length; i++) {
      this.game.players[data.player_id].cards.add_card(requested_cards[i]);
      this.game.players[data.player_id].round_distribution_cards.add_card(requested_cards[i]);
    }

    //  Remove road building card
    this.game.players[data.player_id].cards.dev_cards.road_building--;

    //return it to the pack
    this.game.return_dev_card('road_building');

    // return the purchse immediately
    var data_package = new Data_package();
    data_package.data_type = 'return_road_building';
    data_package.player = this.game.players[data.player_id];

    this.send_to_player('game_turn', data_package);
  } else {
    this.log('error', "Road building called but road building action not visible");
  }
};

/**
 * Monopoly havs been played
 * @param {data_package} data : received data from the player with the monopoly card holding card to take
 */
StateMachine.prototype.activate_monopoly = function (data) {
  if (!data) this.log("error", "func 'activate_monopoly()' missing data");

  var data_package = new Data_package();
  data_package.data_type = 'monopoly_used';

  var cards = 0;
  var action = new Action();
  action.action_type = 'monopoly';
  /**
   * action_data carries all information about parties affected by monopoly
   * action_data = [2, 1, -1, 3, 6(total_stolen), 'grain']
   * shows player 1 lost 2 grain etc...
   */
  action.action_data = [];
  for (var i = 0; i < this.game.players.length; i++) {
    if (i != data.player_id) {

      //find out how many of the given resource a player has
      var stolen_cards = this.game.players[i].cards.count_single_card(data.actions[0].action_data);

      // add those cards to the card count
      cards += stolen_cards;
      action.action_data.push(stolen_cards);

      //remove those cards from the victim's hand
      this.game.players[i].cards.remove_multiple_cards(data.actions[0].action_data, stolen_cards);
    } else {
      // -1 indicates player that played monopoly
      action.action_data.push(-1);
    }
  }

  // push the total into the end of the array
  action.action_data.push(cards);
  // push the card type into the end of the array
  action.action_data.push(data.actions[0].action_data);

  for (var i = 0; i < this.game.players.length; i++) {
    if (i != data.player_id) {

      //tell player that they have just been robbed
      data_package.player = this.game.players[i];

      data_package.player.actions = [];
      //action.action_data = data.actions[0].action_data;
      //send action to everyone (to carry stolen card)
      data_package.player.actions.push(action);
      this.send_to_player('game_turn', data_package);
    }
  }

  //add cards to the player who activated monopoly
  this.game.players[data.player_id].cards.add_cards(data.actions[0].action_data, cards);
  //remove monopoly from player's hand
  if (this.game.players[data.player_id].cards.remove_card('monopoly')) {
    this.log('info', "Removed 'Monopoly' card from", data.player_id);
  } else {
    this.log('error', "Failed to remove 'Monopoly' card from", data.player_id);
    return false;
  }
  // put monopoly back in the deck
  this.game.return_dev_card('monopoly');
  // send the spoils to the victor
  data_package.data_type = 'monopoly_received';
  data_package.player = this.game.players[data.player_id];

  //reuse action -> action_data = [card type, num of cards]
  //action.action_data = [data.actions[0].action_data, cards];

  //send action to everyone (to carry stolen card)
  data_package.player.actions = [];
  data_package.player.actions.push(action);
  this.send_to_player('game_turn', data_package);
  return true;
};

/**
 * Handles the request knight request from player
 * deactivates the knight card for all other players
 * reactivates the knight card if cancelled
 */
StateMachine.prototype.knightRequest = function (data) {
  if (!data) this.log("error", "func 'knightRequest()' missing data");

  if (data.knight_status === 'activate') {
    //  First we need to see if there is 1 or more recent knights purchased
    var recent_purchases = this.game.players[data.player_id].recent_purchases;
    var recent_knights = (recent_purchases.indexOf('knight') === -1 ? 0 : 1);
    recent_knights += (recent_purchases.indexOf('knight', 1) === -1 ? 0 : 1)

    //  Now see if any previously purchased knights are available
    if (this.game.players[data.player_id].cards.dev_cards.knight - recent_knights > 0) {
      let data_package = new Data_package();
      data_package.data_type = 'can_play_knight';
      data_package.player = this.game.players[data.player_id];
      data_package.player.actions = [];
      let action = 'true';
      data_package.player.actions.push(action);
      this.send_to_player('game_turn', data_package);

      this.broadcast('knight_in_use', {
        knight_status: (data.knight_status === 'activate') ? 'disable' : 'enable'
      });
    } else {
      this.log('debug', this.game.players[data.player_id].name +
                " requested Knight in same round as purchase");
    }
  } else if (data.knight_status === 'cancel') {
    this.broadcast('knight_in_use', {
      knight_status: 'enable'
    });
    this.log('debug', this.game.players[data.player_id].name +
                " cancelled playing the Knight");
  }
};

/**
 * Handles the us knight request - adds resources to player
 * Moves the robber to a new location
 */
StateMachine.prototype.useKnight = function (data) {
  if (!data) this.log("error", "func 'useKnight()' missing data");

  let locations = this.game.knightValidLocations(data.player_id);
  let data_package = new Data_package();
  data_package.data_type = 'move_knight_choice';
  data_package.player = this.game.players[data.player_id];
  data_package.player.actions = [];
  let action = new Action();
  action.action_data = locations;
  data_package.player.actions.push(action);
  this.send_to_player('game_turn', data_package);
};

StateMachine.prototype.move_knight_to = function (data) {
  // TODO: check placement is allowed
  // TODO: rob from players on that tile
  if (!data) this.log("error", "func 'move_knight_to()' missing data");
  let loc = data.actions[0].action_data;
  let result = this.game.knight_rob_tile(data.player_id, loc);
  if (!result) {
    this.log("debug", "func 'move_knight_to()' failed to move knight");
    this.send_invalid_msg(this.game.players[data.player_id],
                        'invalid_move',
                        'The player you tried to rob had no cards');
  } else {
    var data_package = new Data_package();
    // send to victim
    data_package.data_type = 'robbed_by_player';
    data_package.player = this.game.players[result.robbed];
    data_package.player.actions = [];
    var action = new Action();
    action.action_data = ({player_id:data.player_id, resource:result.resource});
    data_package.player.actions.push(action);
    this.send_to_player('game_turn', data_package);

    // send to player
    data_package.data_type = 'robbed_player';
    data_package.player = this.game.players[data.player_id];
    action = new Action();
    data_package.player.actions = [];
    action.action_data = ({player_id:result.robbed, resource:result.resource});
    data_package.player.actions.push(action);
    this.send_to_player('game_turn', data_package);
  }
  this.broadcast_gamestate();
};

StateMachine.prototype.start_timer = function () {
  logger.log('debug', "Server side timer set to :" + this.timer_length + " seconds");
  this.timer = setTimeout(this.end_player_turns.bind(this), this.timer_length * 1000);
}
StateMachine.prototype.stop_timer = function () {
  logger.log('debug', "Server side timer stopped.");
  clearTimeout(this.timer);
  this.timer = null;
}
StateMachine.prototype.end_player_turns = function () {
  var players_left = [];
  for (var i = 0; i < this.game.players.length; i++) {
    if (!this.game.players[i].turn_complete) {
      logger.log('Warning', 'Player ' + i + ' in StateMachine ' + this.id + ' never completed their turn');
      players_left.push(i);
    } else {
      logger.log('debug', 'Server side end turn triggered');
    }
  }
  for (var j = 0; j < players_left.length; j++) {
    this.game.players[players_left[j]].connected = false;
    var mock_data = {
      data_type: 'turn_complete',
      player_id: players_left[j],
      actions: []
    }
    this.tick(mock_data);
  }
}

StateMachine.prototype.run_computer_player = function (computer_player_id){
  //Cant use data_package = new Data_package(); here as we are simulation client traffic
  var data_package = {
    data_type: 'turn_complete',
    player_id: computer_player_id
  }

  // Add round logic here


  this.tick(data_package);
}

/**
 * Place a settlement and a road for computer player or disconnected player
 * @return {Actions} [[Action][Action]] : First Action is settlement placement, second is road placement 
 */
StateMachine.prototype.computer_player_setup = function(){
  //logic to add setup information
  this.log("warning", " Player disconnected during setup phase, computer player taking over.");
  var action=new Action();
  action.set_action_type('build_settlement');
  action.set_action_data([13,22,24])
  var action1=new Action();
  action1.set_action_type('build_road');
  action1.set_action_data([21,31,32])



  // return [[/*settlement placement action*/],[/*road placement action*/]]
  return [[action],[action1]]
}

module.exports = {
  StateMachine
};
