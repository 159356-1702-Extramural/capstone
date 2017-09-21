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
var logger  = require('winston');
var Game    = require('./game.js');
var Data_package    = require('../data_api/data_package.js');
var Game_state      = require('../data_api/game_state.js');
var Player          = require('../data_api/player.js');
var Action          = require('../../public/data_api/action.js');
var Cards           = require('../../public/data_api/cards.js');


/*******************************************************
* The state machine structure and logic
*******************************************************/
// draft states: setup, trade, play, end_game

/*
* The state machine contains the Game and operates on it per current state logic
* @param {Integer} id
*/
function StateMachine(id) {
    this.id = id;
    this.game = new Game(this);
    this.state = "setup"; // starting state, states are ref by string for readability
    this.setupComplete = false;
    this.setupSequence = this.setSequence();
    this.setupPointer = 0;
    this.development_cards = this.game.generate_dev_card_deck();
}

/*
* Iterates through states according to flags set
* for example; setup_complete = true would skip that state
* or a return of false on check_win_condition() would skip the
* game_end state
*/
StateMachine.prototype.next_state = function() {
    // TODO: checks on game conditions to determine state
    if (this.state === "setup") {
        console.log('state_machine: in "setup" state'); // TODO: remove later
        logger.log('debug', 'state_machine: in "setup" state');
        // if (conditions to switch state)
        if (this.setupComplete === true) {
            console.log('state_machine: setup state successfully completed'); // TODO: remove later
            logger.log('debug', 'state_machine: setup state successfully completed');
            this.state = "play";
            this.tick();
        }

    } else if (this.state === "trade") {
        console.log('state_machine: in "trade" state'); // TODO: remove later
        logger.log('debug', 'state_machine: in "trade" state');
        // if (conditions to switch state)
        // eg: if (this.trade_complete) this.state = "play"

        // TODO: just passing to the play state as no trade logic yet
        //this.state = "play";

    } else if (this.state === "play") {
        console.log('state_machine: in "play" state'); // TODO: remove later
        logger.log('debug', 'state_machine: in "play" state');
        // if (conditions to switch state)
        // eg: if (this.game.is_won()) this.state = "end_game"
        //     else if (this.round_finished) this.state = "trade"

    } else if (this.state === "end_game") {
        console.log('state_machine: in "end_game" state'); // TODO: remove later
        logger.log('debug', 'state_machine: in "end_game" state');
        // if (conditions to switch state)
    }
}

/***************************************************************
* This is where the actual state logic lives
*
* NOTE: For each incoming player request, this ticks over
*       which means that tracking how many player requests have
*       come in is of use per state
****************************************************************/
StateMachine.prototype.tick = function(data) {
    /************************************************************
    * If in Setup state - game setup logic operates on this.game
    ************************************************************/
    if (this.state === "setup") {

        //  Set the piece
        this.validate_player_builds(data);

        //  Mark turn completed
        this.game.players[data.player_id].turn_complete = true;
        this.game.players[data.player_id].turn_data = data;
        //logger.log('debug', 'Player '+data.player_id+' has tried to place a settlement.');
        //distribute resources from the second round settlement placement

        //second round resources was running 1 too many times so needed to add the extra check
        if(this.setupPointer > this.setupSequence.length / 2 && this.setupPointer <= this.setupSequence.length ){
            console.log("setupPointer: "+ this.setupPointer + " | setupSeq ID: "+ this.setupSequence[this.setupPointer]+ "| data.player_id: "+ data.player_id );
            this.game.secondRoundResources(this.game.players[data.player_id], data);
        }

        // increment round number once
        if(this.setupPointer === this.setupSequence.length / 2){
            this.game.round_num++;
        }

        if (this.setupPointer === this.setupSequence.length) {
            console.log("final player setup");
            //  Do the initial dice roll
            var diceroll;

            // We can't start with a 7 as that would mean starting with robber
            do {
              diceroll = this.game.rollingDice();
            } while (diceroll === 7);

            this.game.allocateDicerollResources(diceroll);

            // Calculate the scores
            this.game.calculateScores();

            this.game.round_num++;

            //  Update the interface
            this.broadcast_gamestate();

            //  Notify each player
            var setup_data = new Data_package();
            setup_data.data_type = 'round_turn';
            this.broadcast('game_turn', setup_data);

            //  Move our state to play
            this.state = "play";

            // For now: increment round number and reset the player turn
            // completion status
            this.game.players.forEach(function(player) {
                player.turn_complete = false;
            });


            this.game_start_sequence();

        } else {
            //call start sequence again from here - startSequence will find the next player to have a turn
            this.game_start_sequence();
            this.broadcast_gamestate();

            // For now: increment round number and reset the player turn
            // completion status
            this.game.players.forEach(function(player) {
                player.turn_complete = false;
            });

        }

        return true;
    }


    /************************************************************
    * If in Trade state - trade logic operates on this.game
    ************************************************************/
    else if (this.state === "trade") {


        var round_complete = this.game.players.every(function(player) {
            return player.turn_complete === true;
        });
        if(round_complete){
            this.next_state();
        }

        return true;
    }

    /************************************************************
    * If in Play state - gameplay logic opperates on this.game
    ************************************************************/
    else if (this.state === "play") {
        //  Validate each player action

        // trading with the bank (4:1, 3:1, 2:1)
        if ( data.data_type === 'trade_with_bank' ){
            this.trade_with_bank(data);
        }
        else if(data.data_type === 'buy_dev_card'){

            this.buy_dev_card(data);
        }
        else if (data.data_type === 'request_knight') {
          // Player has indicated they're going to use knight
          // disable the knight for all other players
          this.knightRequest(data);
        }
        else if (data.data_type === 'use_knight') {
          // Players has has chosen a resource to get with the knight
          // update the player, reposition the robber
          this.useKnight(data);

          // Add flag so we can notify other players knight has been played
          this.game.knight_player_id = data.player_id;
        }
        else if(data.data_type === 'year_of_plenty_used'){
            logger.log('debug','year of plenty played by player ' + data.player_id);
            this.activate_year_of_plenty(data);
        }
        else if(data.data_type === 'road_building_used'){
            logger.log('debug','road building played by player ' + data.player_id);
            this.activate_road_building(data);
        }
        else if ( data.data_type === 'monopoly_used' ){
            this.game.monopoly = -1;
            this.activate_monopoly(data);
        }
        else if(data.data_type === 'monopoly_not_used'){

            //ignore this if monopoly not in play
            if(this.game.monopoly === data.player_id){
                var data_package = new Data_package();
                data_package.data_type = "round_turn";

                // player with monopoly chose not to play it... tell all players to have their turn
                for(var i = 0; i < this.game.players.length; i++){
                    if( i !== this.game.monopoly){
                        data_package.player = this.game.players[i];
                        this.send_to_player('game_turn', data_package);
                    }
                }
            }else{logger.log('monopoly ignored');}
        }
        // this section is activated when each player finishes their turn
        else if(data.data_type === 'turn_complete'){
          // Handle standard gameplay rounds
          this.game.players[data.player_id].turn_complete = true;
          this.game.players[data.player_id].turn_data = data;

          // Determine if the round is complete, ie. all players have
          // indicated their round is complete
          var round_complete = this.game.players.every(function(player) {
              return player.turn_complete === true;
          });

        if (round_complete) {

          this.validate_player_builds(data);

          // Advance the round
          this.game.round_num++;

          // Calculate the scores
          var largest_army = {
              player_id: -1,
              knights_played: 0,
              current_owner : -1 //check if a change of largest army owner
          }
          for (var p=0; p< this.game.players.length; p++) {
            var player_id = this.game.players[p].id;
            this.game.players[p].score.longest_road = this.game.board.longest_road_for_player(player_id);

            if(this.game.players[p].score.largest_army){
                //this player already has largest army
                largest_army.current_owner = p;
            }

            var played_knights = this.game.players[p].cards.dev_cards.knight_played;
            // Only look if player has played 3 or more knights
            if(played_knights > 2 && played_knights > largest_army.knights_played){
                largest_army.player_id = player_id;
                largest_army.knights_played = played_knights;
            
            // if there are two players with the same score
            }else if(played_knights >  2 && played_knights === largest_army.knights_played){
                
                // is the current owner one of these?
                if(this.game.players[largest_army.current_owner].cards.dev_cards.knight_played === largest_army.knights_played){
                    largest_army.player_id = largest_army.current_owner;
                }else{
                    //two new players have largest army.. neither gets it.
                    largest_army.player_id = -1;
                }

                //keep largest_army.knights_played value as someone may still have a higher value
            }
          };

          // check if we have someone eligable for largest army
          if(largest_army.player_id >= 0 && largest_army.knights_played > 2){

            //if player doesn't already has largest_army, add player
            if(!this.game.players[largest_army.player_id].score.largest_army){
               this.game.players[largest_army.player_id].score.largest_army = true;

               //if someone already has the largest army, remove it from thier hand.
               if(largest_army.current_owner !== -1){
                this.game.players[largest_army.current_owner].score.largest_army = false;
               }
            }
          }

          this.game.calculateScores();

          // End the game if we have a winner
          if (this.game.haveWinner()) {
            this.broadcast_end();
            return;
          }

          // Resource distribution for next round
          for (var i = 0; i < this.game.players.length; i++) {
            // Reset round distribution cards
            this.game.players[i].round_distribution_cards = new Cards();
          }


          // House rule 7 only comes up once someone has created their first non-startup building
          var player_has_built = false;
          for (var i = 0; i < this.game.players.length; i++) {
              if (this.game.players[i].score.total_points > 2) {
                player_has_built = true;
                  break;
              }
          }

          //  Next dice roll
          var diceroll = 1;
          var diceroll_check = 1;
          do {
              //    Get the initial dice roll
            diceroll = this.game.rollingDice();

            //  If not player has built, we don't allow a 7
            if (diceroll == 7 && !player_has_built) {
                diceroll = 1;

            //  Nerf the robber just a little to prevent too frequent occurance
            /*
            } else if (diceroll == 7 && diceroll_check == 1) {
                diceroll_check = this.game.rollingDice();
                if (diceroll_check != 7) {
                    diceroll = diceroll_check;
                }
                */
            }
          } while (diceroll < 2);

          //disable the robber for testing
          if(diceroll === 7 && this.game.robber === 'disabled'){
              console.log("robber disabled, changing roll to 8");
            this.game.dice_roll = [4, 4];
            diceroll = 8;
          }

          if (diceroll !== 7) {
            this.game.allocateDicerollResources(diceroll);
          } else {
            this.game.moveRobber();
            this.game.robPlayers();
          }

          this.broadcast_gamestate();

          //  Reset player statuses
          this.game.players.forEach(function(player) {
            player.turn_complete = false;
          });

          // Reset the played knight flag on the game
          this.game.knight_player_id = -1;

          var setup_data = new Data_package();
          setup_data.data_type = 'round_turn';

          //  Notify players if there is no monopoly in play
          if(this.game.monopoly < 0){

            this.broadcast('game_turn', setup_data);
          }else{

            // if there is a monopoly in play, notify only that player to start their turn
            setup_data.player = this.game.players[this.game.monopoly];
            this.send_to_player('game_turn', setup_data);

            //tell the player who finished the round to wait (if they aren't the monopoly player)
            if(this.game.monopoly !== data.player_id){
                setup_data.data_type = 'wait_others';
                this.game.players[data.player_id].socket.emit('game_turn', setup_data);

            }
          }

        } else {
            //  Tell this player to wait and update the interface for all others
            var waiting = [];
            for(var i = 0; i < this.game.players.length; i++){
                waiting.push([i, this.game.players[i].turn_complete]);
            }

            for(var i = 0; i < this.game.players.length; i++){
                if (i == data.player_id) {
                    var setup_data = new Data_package();
                    setup_data.data_type = 'wait_others';
                    this.game.players[data.player_id].socket.emit('game_turn', setup_data);
                } else {
                    this.game.players[i].socket.emit('update_players_waiting', waiting);
                }
            }
        }
      }

      this.next_state();
      return true;
    }

    /************************************************************
    * If in end_game state - gameplay logic opperates on this.game
    ************************************************************/
    else if (this.state === "end_game") {
      return true;
    }
    return false;
};

/*****************************************************************
 Gathers up the state of the game and sends the current gamestate
 to all the players contains all data to render the current state
 of the game in the browser
******************************************************************/
StateMachine.prototype.broadcast_gamestate = function() {

  var player;
  var data_package;

  // Set up the game state
  var game_state = new Game_state();

  var players = this.game.players.map(function (player, idx) {
    return {
      id: idx,
      name: player.name,
      colour: player.colour,
      points: player.score.total_points,
      victory_points: player.cards.victory_point_cards
    };
  });

  game_state.players          = players;
  game_state.board            = this.game.board;
  game_state.round_num        = this.game.round_num;
  game_state.dice_values      = this.game.dice_roll;
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
StateMachine.prototype.broadcast_end = function() {

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
      end_game_data.winners_name = player.name;
    }
  }

  this.broadcast('game_end', end_game_data);
};


/// Messages all players in a game
StateMachine.prototype.broadcast = function(event_name, data) {
    console.log('Broadcasting event: ' + event_name);
    this.game.players.forEach(function(player) {
        player.socket.emit(event_name, data);
    });
};

/// Messages individual player in a game
StateMachine.prototype.send_to_player = function(event_name, data) {

    var player = this.game.players[data.player.id];

    /**
     *  Check to see if there is a socket object in the data.player object.
     *  If so, clone the player, remove the socket and add the clone to data
     */
    var clonedPlayer;
    if(player.socket){
        clonedPlayer = Object.assign({}, this.game.players[data.player.id]);
        delete clonedPlayer.socket;
        data.player = clonedPlayer;
    }
    logger.log('debug', 'preparing to send data to player '+data.player.id);

    player.socket.emit(event_name, data);
    logger.log('debug', 'data sent to player '+data.player.id);
};

/***************************************************************
* Start Sequence
***************************************************************/
StateMachine.prototype.game_start_sequence = function(initiatingGame){
    logger.log('debug', 'game_start_sequence function called.');

    //Create data package for setup phase
    var setup_data = new Data_package();
    setup_data.data_type = 'setup_phase';

    if(this.setupPointer < this.setupSequence.length){

        // send all players except one a wait command
        for (var i = 0; i < this.game.players.length; i++){

            if(i !== this.setupSequence[this.setupPointer]){

                //not this player's turn to place a settlement and road
                setup_data.player = 0;
                logger.log('debug', 'Send data for player to wait');
                this.game.players[i].socket.emit('game_turn', setup_data);
            } else {

                //this player's turn to place a settlement and road (1=first place, 2 = 2nd placement)
                if(this.setupPointer < this.setupSequence.length / 2){
                    setup_data.player = 1;
                } else {
                    setup_data.player = 2;
                }
                this.game.players[i].socket.emit('game_turn', setup_data);
            }
        }
    } else {
        this.setupComplete = true;
        console.log("Setup complete");
        logger.log('debug', 'Setup phase completed');
        setup_data.data_type = 'setup_complete';
        this.broadcast('game_turn', setup_data);

        this.game.players.forEach(function(player) {
          player.turn_complete = false;
        });

    }

    //required because it increments pointer out of position before player starts
    this.setupPointer++;

};

/***************************************************************
* Validate player builds/actions
***************************************************************/
StateMachine.prototype.validate_player_builds = function(data){
    console.log('validate_player_builds called');
    logger.log('debug', 'validate_player_builds function called.');

    if (this.game.round_num < 3) {
        //  During the seutp, just set the piece
        for(var i = 0; i < data.actions.length; i++){
            var player_id   = data.player_id;
            var item        = data.actions[i].action_type; //settlement or road
            var index       = data.actions[i].action_data.id;
            this.game.board.set_item(item, index, player_id);
            data.actions[i].action_result = 0;

            //  Set harbor if needed
            this.set_harbor(i, data);
        }
    } else {
        //  Our first pass is to do a direct check for conflicts
        for (var p = 0; p < this.game.players.length; p++) {
            var data = this.game.players[p].turn_data;

            for(var i = 0; i < data.actions.length; i++){
                var player_id   = data.player_id;
                var item        = data.actions[i].action_type; //settlement or road
                var index       = data.actions[i].action_data.id;
                var boost_cards = data.actions[i].boost_cards;

                var valid = true;

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
            for (var i = 0; i < data.actions.length; i++) {
                if (data.actions[i].action_result == 0) {
                    var object_type = data.actions[i].action_type.replace("build_", "");
                    var node = (object_type == "road" ? this.game.board.roads[data.actions[i].action_data.id] : this.game.board.nodes[data.actions[i].action_data.id]);

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
            for (var a = 0; a < data.actions.length; a++) {
                if (data.actions[a].action_result == 0) {
                    //  Remove the cards
                    if(data.actions[a].boost_cards !== null){
                        this.game.players[p].cards.remove_boost_cards(data.actions[a].boost_cards);
                    }
                }
            }
        }

    }
}

StateMachine.prototype.set_harbor = function(index, data) {
    if (data.actions[index].action_data.harbor) {
        if (data.actions[index].action_data.harbor.length > 0) {
            this.game.players[data.player_id].trading[data.actions[index].action_data.harbor] = true;
        }
    }
}

/***************************************************************
* Determine if there is a conflict and who wins the conflict
***************************************************************/
StateMachine.prototype.wins_conflict = function(player_id, item, index, boost_cards){

    for (var i = 0; i < this.game.players.length; i++) {
        //  Ignore this player
        if (this.game.players[i].id != player_id) {
            //  Loop through next player actions
            for (var j = 0; j < this.game.players[i].turn_data.actions.length; j++) {
                if (this.game.players[i].turn_data.actions[j].action_type == item && this.game.players[i].turn_data.actions[j].action_data.id == index) {
                    //  Conflict found

                    //  Find the matching object for the current player being checked
                    var current_player_action_index = -1;
                    for (var k = 0; k < this.game.players[player_id].turn_data.actions.length; k++) {
                        if (this.game.players[player_id].turn_data.actions[k].action_type == item && this.game.players[player_id].turn_data.actions[k].action_data.id == index) {
                            current_player_action_index = k;
                            break;
                        }
                    }

                    //  First check to see if main player used road building
                    if (this.game.players[player_id].turn_data.actions[current_player_action_index].boost_cards.length > 0) {
                        if (item == "build_road" && this.game.players[player_id].turn_data.actions[current_player_action_index].boost_cards[0] == "road_building") {
                            return 0;   //  Automatic win
                        }
                    }

                    //  Then check to see if other player used road building
                    if (this.game.players[i].turn_data.actions[j].boost_cards.length > 0) {
                        if (item == "build_road" && this.game.players[i].turn_data.actions[j].boost_cards[0] == "road_building") {
                            return 2;   //  Automatic Loss
                        }
                    }

                    //  Compare # of boost cards
                    var player_boost_card_count = 0;
                    if (boost_cards) { player_boost_card_count = boost_cards.length; }
                    var other_player_boost_card_count = 0;
                    if (this.game.players[i].turn_data.actions[j].boost_cards) { other_player_boost_card_count = this.game.players[i].turn_data.actions[j].boost_cards.length; }

                    if (player_boost_card_count == other_player_boost_card_count) {
                        return 1;   //  Tie
                    }
                    if (player_boost_card_count > other_player_boost_card_count) {
                        return 0;   //  Win
                    }
                    return 2;       //  Lost
                }
            }
        }
    }
    return 0;   //  Win
}

/***************************************************************
* Check a road/settlement to see if it connects up with another from this player
***************************************************************/
StateMachine.prototype.has_valid_path = function(player, object_type, node, original_node, checked) {
    var has_path = false;

    //  Make sure we have not already checked this node/road
    if (checked.indexOf(object_type + ":" + node.id) > -1) {
        return has_path;
    }
    checked += object_type + ":" + node.id + ",";

    //  Using nodes or roads?
    var the_nodes = this.game.board.nodes;
    if (object_type == "road") { the_nodes = this.game.board.roads; }

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
            has_path = has_path || this.has_valid_path(player, "settlement", this.game.board.nodes[node.connects[i]], original_node, checked);
            if (has_path) { break; }
        }
    } else {
        //  If this is a settlement, and someone else owns it, we cannot continue on this path
        if (node.owner != player.id && node.owner > -1) {
            return false;
        }

        for (var i = 0; i < node.n_roads.length; i++) {
            has_path = has_path || this.has_valid_path(player, "road", this.game.board.roads[node.n_roads[i]], original_node, checked);
            if (has_path) { break; }
        }
        if (!has_path) {
            for (var i = 0; i < node.n_nodes.length; i++) {
                has_path = has_path || this.has_valid_path(player, "settlement", this.game.board.nodes[node.n_nodes[i]], original_node, checked);
                if (has_path) { break; }
            }
        }
    }
    return has_path;
};


StateMachine.prototype.trade_with_bank = function (data) {
    logger.log('debug',"trade action with bank, player: " + data.player_id);

    //var player = this.game.players[data.player_id];

    //split the data to get the resource type: currently string = trade_sheep
    var cards_for_bank = data.actions[0].action_data.cards_for_the_bank.split('_');
    var cards_from_bank = data.actions[0].action_data.cards_from_the_bank.split('_');

    var cards_for_trade = data.actions[0].action_data.cards_for_trade;

    // check if cards available and remove cards from hand
    if(this.game.players[data.player_id].cards.remove_multiple_cards(cards_for_bank[1], cards_for_trade)){
        // add card to hand

        this.game.players[data.player_id].cards.add_card(cards_from_bank[1]);
        this.game.players[data.player_id].round_distribution_cards = new Cards();
        this.game.players[data.player_id].round_distribution_cards.add_card(cards_from_bank[1]);

        //send card back to player
        var data_package = new Data_package();
        data_package.data_type = "returned_trade_card";
        data_package.player = this.game.players[data.player_id];
        this.send_to_player('game_turn', data_package);
    }else{
        //trade failed server side
        logger.log("error","Bank trade approved client side but failed server side.");

        var data_package = new Data_package();
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
        console.log('package sent');
    }
};

StateMachine.prototype.buy_dev_card = function (data){

    //check if player has available cards
    if(this.game.players[data.player_id].cards.available_cards('dev_card')){
        this.game.players[data.player_id].cards.remove_cards('dev_card');

        // changed to shift as development_cards[0] needs to be removed
        var card = this.development_cards.shift();

        // NOTE: Debugging ... to test dev card activate the card you want here
        // card = 'knight';
        // card = 'road_building';
        console.log('Dev card purchased: '+card);
        logger.log('debug','Dev card purchased: '+card);
        console.log("-----------------"+card);

        if(card === 'monopoly'){
            this.game.monopoly = data.player_id;
        }

        this.game.players[data.player_id].cards.add_card(card);
        this.game.players[data.player_id].round_distribution_cards.add_card(card);

        var data_package = new Data_package();
        data_package.data_type = 'buy_dev_card';
        data_package.player = this.game.players[data.player_id];

        //  Refreshes all player's scores, strip out to calc only one players score :- TODO
        this.game.calculateScores();
        this.send_to_player('game_turn', data_package );

    }else{

        console.log('error', 'Player '+ data.player_id + ' does not have enough resources to buy a dev card');
        // TODO send a fail message
    }

};


StateMachine.prototype.activate_year_of_plenty = function (data) {

    //request sent immediately so action will always be first but check to be sure
    if(data.actions[0].action_type === 'year_of_plenty'){
        var requested_cards = data.actions[0].action_data;
        for(var i = 0; i < requested_cards.length; i++){
            this.game.players[data.player_id].cards.add_card(requested_cards[i]);
            this.game.players[data.player_id].round_distribution_cards.add_card(requested_cards[i]);
        }

        this.game.players[data.player_id].cards.remove_card('year_of_plenty');
        // return the purchse immediately

        //return the card to the pack
        this.game.return_dev_card('year_of_plenty');

        var data_package = new Data_package();
        data_package.data_type = 'return_year_of_plenty';
        data_package.player = this.game.players[data.player_id];

        this.send_to_player('game_turn',data_package);
    }else{
        console.log("Year of plenty called but year of plenty action not visible");
        logger.log('error', "Year of plenty called but year of plenty action not visible");
    }

}

StateMachine.prototype.activate_road_building = function (data) {

    //request sent immediately so action will always be first but check to be sure
    if(data.actions[0].action_type === 'road_building'){
        var requested_cards = data.actions[0].action_data;
        for(var i = 0; i < requested_cards.length; i++){
            this.game.players[data.player_id].cards.add_card(requested_cards[i]);
            this.game.players[data.player_id].round_distribution_cards.add_card(requested_cards[i]);
        }

        //  Remove road building card
        this.game.players[data.player_id].cards.dev_cards.road_building --;

        //return it to the pack
        this.game.return_dev_card('road_building');

        // return the purchse immediately
        var data_package = new Data_package();
        data_package.data_type = 'return_road_building';
        data_package.player = this.game.players[data.player_id];

        this.send_to_player('game_turn',data_package);
    }else{
        console.log("Road building called but road building action not visible");
        logger.log('error', "Road building called but road building action not visible");
    }
}


/**
 * Monopoly havs been played
 * @param {data_package} data : received data from the player with the monopoly card holding card to take
 */
StateMachine.prototype.activate_monopoly = function (data) {

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
    for (var i = 0; i < this.game.players.length; i++){
        if (i != data.player_id){

            //find out how many of the given resource a player has
            var stolen_cards = this.game.players[i].cards.count_single_card(data.actions[0].action_data);

            // add those cards to the card count
            cards += stolen_cards;
            action.action_data.push(stolen_cards);

            //remove those cards from the victim's hand
            this.game.players[i].cards.remove_multiple_cards(data.actions[0].action_data, stolen_cards);
        }
        else{
            // -1 indicates player that played monopoly
            action.action_data.push(-1);
        }
    }

    // push the total into the end of the array
    action.action_data.push(cards);

    // push the card type into the end of the array
    action.action_data.push(data.actions[0].action_data);

    for (var i = 0; i < this.game.players.length; i++){
        if (i != data.player_id){

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
    this.game.players[data.player_id].cards.remove_card('monopoly');

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
};

/**
 * Handles the request knight request from player
 * deactivates the knight card for all other players
 * reactivates the knight card if cancelled
 */
StateMachine.prototype.knightRequest = function(data) {
  var status = (data.knight_status === 'activate') ? 'disable' : 'enable';
  this.broadcast('knight_in_use', { knight_status : status })
};

/**
 * Handles the us knight request - adds resources to player
 * Moves the robber to a new location
 */
StateMachine.prototype.useKnight = function(data) {
  this.game.knightMoveRobber(data.player_id);

console.log(data);

  // Add the resource played to the players stash on the back end
  this.game.players[data.player_id].cards.add_cards(data.resource, 1);

  // Update player card details to reflect they have played a knight
  this.game.players[data.player_id].cards.dev_cards.knight_played++;
  this.game.players[data.player_id].cards.dev_cards.knight--;
};


StateMachine.prototype.setSequence = function (){
    var player_num = process.env['players'];
    if(typeof player_num === 'undefined'){player_num = 2;}
    if(parseInt(player_num) === 4){
      return [0,1,2,3,3,2,1,0];
    }
    return [0,1,1,0];
};


module.exports = { StateMachine };
