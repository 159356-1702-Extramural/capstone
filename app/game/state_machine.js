// TODO: Move elements of game.js in to state_machine

var logger = require('winston');
var Game    = require('./game.js');
var Player  = require('./player.js');
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
    if (state === "setup") {
        // if (conditions to switch state)
    } else if (state === "trade") {
        // if (conditions to switch state)
    } else if (state === "round") {
        // if (conditions to switch state)
    } else if (state === "end") {
        // if (conditions to switch state)
    }
}

/// This the main function that all server requests should
/// eventually come through
///
/// This is where the actual state logic lives
StateMachine.prototype.do_gameplay = function(data) {
    if (state === "setup") {

    } else if (state === "trade") {

    } else if (state === "round") {

    } else if (state === "end") {

    }
}

/**
 * Gathers up the state of the game and sends the current gamestate
 * to all the players contains all data to render the current state
 * of the game in the browser
 */
StateMachine.prototype.broadcast_gamestate = function() {
    var players = this.game.players.map(function(player, idx) {
        return {
            id              : idx,
            name            : player.name,
            turn_complete   : player.turn_complete
        };
    });

    var game_data = {
        players   : players,
        round_num : this.game.round_num
    };

    broadcast(this, 'update_game', game_data);
};

/********************************************************/
/* Games is technically Lobby - TODO: maybe rename back */
/********************************************************/

function Games() {
    this.games = [] // array of StateMachine objects, each corrosponds to one started game
}

/**
 * Finds a game adds a user to it, create new game instances
 * as needed
 *
 * This is where the bulk of player setup will be, eg: sockets + game
 *
 * @param {obj} socket
 * @param {obj} data
 */
Games.prototype.assign_player = function(socket, data) {
    var self = this; // assign this object to a var so we can use it...
    var player = new Player(socket, data);

    // Create a new game instance if we dont have available to put this player into
    if (this.games.length === 0 || this.games[this.games.length - 1].game_full()) {
        console.log('Creating an new game');
        this.games.push(new StateMachine());
    }
    var state_machine = this.games[this.games.length-1];

    player.socket.emit('player_id', { id : player.id });
    // Notify the other players that a new player has joined
    broadcast(state_machine, 'player_joined', {
        player_count    : state_machine.game.players.length,
        max_players     : state_machine.game.max_players
    });
    /**************************************************/
    /*    Create listeners on sockets for messages    */
    /**************************************************/
    /// Game update will parse the data and find the players action.
    /// From there the state_machine will parse the unpacked data
    // TODO: an alternative to "action" in the API, is to have the
    //       action be the message here
    player.socket.on('game_update', function(data) {
        // state_machine function to be called
        state_machine.do_gameplay(data);
    });

    player.socket.on('disconnect', function() {
        broadcast(state_machine, 'player_quit', {
            message : player.name + ' has disconnected. Game Over.'
        });

        self.remove_game(state_machine);
    });
    /**************************************************/
    /*           Listener creation ends               */
    /**************************************************/

    console.log('Number of games = ' + this.games.length);
    this.games[this.games.length - 1].game.add_player(player);

    // Start the game if we have all the players
    if (state_machine.game.game_full()) {
        broadcast(state_machine, 'game_start', {});
        //  Create the board and send it to the clients
        broadcast(state_machine, 'build_board', state_machine.game.buildBoard());
        //this.broadcast_gamestate();
        state_machine.game.startSequence();
    }
};


/// Removes a game instance from the active games
Games.prototype.remove_game = function(state_machine) {
    var idx = this.games.indexOf(state_machine);
    this.games.splice(idx, 1);
};

/// Resets all the games - use for debugging
Games.prototype.reset_game = function() {
    this.games = [];
    console.log('Games have been reset.');
};

/********************************************************/
/* General purpose functions for Games and StateMachine */
/********************************************************/

/// Messages all players in a game
function broadcast(state_machine, event_name, data) {
    console.log('Broadcasting event: ' + event_name);
    state_machine.game.players.forEach(function(player) {
        player.socket.emit(event_name, data);
    });
};

/*
 * Rolling two dices, and return the sum of the two dices number.
 */
function rollingDice() {
    var dice1=Math.ceil(Math.random() * 6 );
    var dice2=Math.ceil(Math.random() * 6 );
    return dice1+dice2;
}

module.exports = Games;
