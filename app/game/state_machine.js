// TODO: Move elements of game.js in to state_machine

var logger  = require('winston');
var Game    = require('./game.js');
var Data_package    = require('../data_api/data_package.js');
var Game_state      = require('../data_api/game_state.js');
var Player          = require('../data_api/player.js');
var Action          = require('../../public/data_api/action.js');
var Cards           = require('../data_api/cards.js');
/*
*  The core of the server side
*
*  This is the state machine that handles;
*   - incoming connections
*   - assigning and starting games
*   - iteration of each games gameplay
*   - end game
*/

/*
draft states:
    setup
    trade
    round
    end
*/

/*******************************************************
* The state machine structure and logic
*******************************************************/

/// The state machine contains the Game and operates on it
/// One state machine per game
function StateMachine(id) {
    this.id = id;
    this.game = new Game(this);
    this.state = "setup"; // starting state, states are ref by string for readability
    this.setupComplete = false;
    this.setupSequence = [0,1,1,0];
    this.setupPointer = 0;
}

/// Only called to create a new game
StateMachine.prototype.create = function() {
    this.games.push(new Game(this));
};

/// Iterates through states according to flags set
/// for example; setup_complete = true would skip that state
/// or return false on check_win_condition would skip the
/// finish (game_end) state
StateMachine.prototype.next_state = function() {
    // TODO: checks on game conditions to determine state
    if (this.state === "setup") {
        // if (conditions to switch state)
        if(this.setupComplete)
            this.state = "trade";

    } else if (this.state === "trade") {
        // if (conditions to switch state)
        // eg: if (this.trade_complete) this.state = "play"

    } else if (this.state === "play") {
        // if (conditions to switch state)
        // eg: if (this.game.is_won()) this.state = "end_game"
        //     else if (this.round_finished) this.state = "trade"

    } else if (this.state === "end_game") {
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

        //TODO change below if statement to check whether setup placement valid
        var valid = true;
        //set any invalid actions action.action_result = false

        if(valid){
            for(var i = 0; i < data.actions.length; i++){
                var player_id   = data.player_id;
                var item        = data.actions[i].action_type; //house or road
                var index       = data.actions[i].action_data.id;

                //  TODO: I think this can be removed
                // if ( item === 'road' ){
                //     index       = data.actions[i].action_data.id;
                // }else if (item === 'house' ){
                //     index       = data.actions[i].action_data.id;
                // }
                this.game.board.set_item(item, index, player_id);
            }
        }else{
            //  send back an invalid move package
            var data_package = new Data_package();
            var player = new Player();
            player.id = data.player_id;
            player.actions = data.player.actions;
            data_package.data_type = 'invalid_move';
            data_package.player = player;
            this.send_to_player('game_update', data_package);
        }

        this.game.players[data.player_id].turn_complete = true;
        this.game.players[data.player_id].turn_data = data;
        //logger.log('debug', 'Player '+data.player_id+' has tried to place a settlement.');
        //distribute resources from the second round settlement placement


        console.log('this.setupPointer: ', this.setupPointer);



        if(this.setupPointer > this.setupSequence.length / 2){
            this.game.secondRoundResources(this.game.players[data.player_id], data);
            this.game.round_num++;
        }

        //call start sequence again from here - startSequence will find the next player to have a turn
        this.game_start_sequence();
        this.broadcast_gamestate();

        // For now: increment round number and reset the player turn
        // completion status
        this.game.players.forEach(function(player) {
            player.turn_complete = false;
        });

        for(var i = 0;  i < this.game.players.length; i++){
            // In normal play, all players should return true, in setup phase only one will
            if(this.game.players[i].turn_complete){
                //add player data to player object
                this.next_state();
            }
        }

        return true;
    }

    /************************************************************
    * If in Trade state - trade logic operates on this.game
    ************************************************************/
    else if (this.state === "trade") {
        this.next_state();
        return true;
    }

    /************************************************************
    * If in Play state - gameplay logic opperates on this.game
    ************************************************************/
    else if (this.state === "play") {
        // Handle standard gameplay rounds
        this.game.players[data.player_id].turn_complete = true;
        this.game.players[data.player_id].turn_data = data;

        // Determine if the round is complete, ie. all players have
        // indicated their round is complete
        var round_complete = this.game.players.every(function(player) {
            return player.turn_complete === true;
        });

        for(var i = 0;  i < this.game.players.length; i++){
            // In normal play, all players should return true, in setup phase only one will
            if(this.players[i].turn_complete){
                //add player data to player object
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
}

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
    player.socket.emit(event_name, data);
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
    }
    this.setupPointer++;
}

module.exports = { StateMachine };
