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
    this.setupSequence = [0,1,1,0];
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
        //check data and add to player

        //  Validate each player action
        this.validate_player_builds(data);

        //  Mark turn completed
        this.game.players[data.player_id].turn_complete = true;
        this.game.players[data.player_id].turn_data = data;
        //logger.log('debug', 'Player '+data.player_id+' has tried to place a settlement.');
        //distribute resources from the second round settlement placement

        if(this.setupPointer > this.setupSequence.length / 2){
            this.game.secondRoundResources(this.game.players[data.player_id], data);
            this.game.round_num++;
        }

        if (this.game.round_num > 2) {

            //  Do the initial dice roll
            var diceroll;

            // We can't start with a 7 as that would mean starting with robber
            do {
              diceroll = this.game.rollingDice();
            } while (diceroll === 7);

            this.game.allocateDicerollResources(diceroll);

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
        if(data.data_type === 'buy_dev_card'){

            var player = this.game.players[data.player_id];

            //check if player has available cards
            if(player.cards.available_cards('dev_card')){
                player.cards.remove_card('dev_card');

                var card = this.development_cards.pop();
                console.log('dev card purchased: '+card);

                player.cards.add_card(card);
                player.round_distribution_cards.add_card(card);
                var data_package = new Data_package();
                data_package.data_type = 'buy_dev_card';
                data_package.player = player;
                this.send_to_player('game_turn', data_package );

            }else{
                logger.log('error', 'Player '+ player.id + ' does not have enough resources to buy a dev card');
                // TODO send a fail message
            }
        }

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

        this.validate_player_builds(data);

        // Handle standard gameplay rounds
        this.game.players[data.player_id].turn_complete = true;
        this.game.players[data.player_id].turn_data = data;

        // Determine if the round is complete, ie. all players have
        // indicated their round is complete
        var round_complete = this.game.players.every(function(player) {
            return player.turn_complete === true;
        });

        if (round_complete) {

          // Calculate the scores
          this.game.calculateScores();

          // End the game if we have a winner
          if (this.game.haveWinner()) {
            // TODO: end the game
          }

          //  Advance the round
            this.game.round_num++;

            // Resource distribution for next round
            for (var i = 0; i < this.game.players.length; i++) {
                // Reset round distribution cards
                this.game.players[i].round_distribution_cards = new Cards();
            }


            // House rule 7 only comes up once someone has created their first non-startup building

            //  Next dice roll
            var diceroll;

            do {
              diceroll = this.game.rollingDice();
            } while (false); // TODO: logic to determine if a player has built yet
                             // eg. while (diceroll === 7 && no_build_flag === true)

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

            //  Notify players
            var setup_data = new Data_package();
            setup_data.data_type = 'round_turn';
            this.broadcast('game_turn', setup_data);

        } else {
            //  Tell this player to wait
            var setup_data = new Data_package();
            setup_data.data_type = 'wait_others';
            this.game.players[data.player_id].socket.emit('game_turn', setup_data);
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
      points: player.score.total_points
    };
  });

  game_state.players          = players;
  game_state.board            = this.game.board;
  game_state.round_num        = this.game.round_num;
  game_state.dice_values      = this.game.dice_roll;

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
StateMachine.prototype.game_start_sequence = function(setup_data){
    console.log('game_start_sequence called');
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
          player.turn_complete = true;
        });

    }
    this.setupPointer++;
}

/***************************************************************
* Validate player builds/actions
***************************************************************/
StateMachine.prototype.validate_player_builds = function(data){
    console.log('validate_player_builds called');
    logger.log('debug', 'validate_player_builds function called.');

    var invalid_actions = [];
    for(var i = 0; i < data.actions.length; i++){
        var player_id   = data.player_id;
        var item        = data.actions[i].action_type; //house or road
        var index       = data.actions[i].action_data.id;

        var valid = true;
        //TODO Build logic to validate moves, check for conflicts, and resolve/fail conflicts

        if (valid) {
            this.game.board.set_item(item, index, player_id);
        } else {
            invalid_actions.push(data.actions[i]);
        }
    }

    //  Let the player know if there were moves that failed
    if (invalid_actions.length > 0) {
        var data_package = new Data_package();
        var player = new Player();
        player.id = data.player_id;
        player.actions = invalid_actions;
        data_package.data_type = 'invalid_move';
        data_package.player = player;
        this.send_to_player('game_update', data_package);
    }

}

StateMachine.prototype.trade_with_bank = function (data) {
    logger.log('debug',"trade action with bank, player: " + data.player_id);
    console.log("trade action with bank, player: " + data.player_id);
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
}
module.exports = { StateMachine };
