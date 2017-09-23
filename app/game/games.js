var logger = require('winston');
var Player = require('../data_api/player.js');
var sm = require("./state_machine.js");

/********************************************************
* Games was Lobby - renamed to suit task
*
* The primary task here is to funnel players in to games,
* link socket requests, and to manage games
********************************************************/

function Games() {
    this.games = []; // array of StateMachine objects, each corrosponds to one started game
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

    // add 20 of each resource to player's hand for testing
    var addTestCards = parseInt(process.env['startWithCards']);
    if( addTestCards !== 0) {
        player.cards.add_cards('ore', addTestCards);
        player.cards.add_cards('sheep',addTestCards);
        player.cards.add_cards('brick', addTestCards);
        player.cards.add_cards('grain', addTestCards); 
        player.cards.add_cards('lumber', addTestCards);
    }

    // Create a new game instance if we dont have available to put this player into
    if (this.games.length === 0 || this.games[this.games.length - 1].game.game_full()) {
        console.log('Creating an new game');
        this.games.push(new sm.StateMachine());
    }
    var state_machine = this.games[this.games.length-1];

    if(state_machine.game.test_mode === 'false'){
        state_machine.game.test_mode = this.set_test_flag();
    }

    // add settlements and roads, skipping setup phase for testing purposes
    if(process.env['setup'] === 'skip'){
        state_machine.state = 'play';
        state_machine.setupComplete = true;
        state_machine.setupPointer = 8;
        state_machine.game.round_num = 3;

        state_machine.game.board.set_item('build_settlement', 24, 0);
        state_machine.game.board.set_item('build_settlement', 32, 0);
        state_machine.game.board.set_item('build_road', 32, 0);
        state_machine.game.board.set_item('build_road', 45, 0);

        state_machine.game.board.set_item('build_settlement', 17, 1);
        state_machine.game.board.set_item('build_settlement', 42, 1);
        state_machine.game.board.set_item('build_road', 26, 1);
        state_machine.game.board.set_item('build_road', 58, 1);

        if(parseInt(process.env['players']) === 4){
            state_machine.game.board.set_item('build_settlement', 10, 2);
            state_machine.game.board.set_item('build_settlement', 8, 2);
            state_machine.game.board.set_item('build_road', 15, 2);
            state_machine.game.board.set_item('build_road', 13, 2);

            state_machine.game.board.set_item('build_settlement', 43, 3);
            state_machine.game.board.set_item('build_settlement', 30, 3);
            state_machine.game.board.set_item('build_road', 50, 3);
            state_machine.game.board.set_item('build_road', 42, 3);
        }
    }

    // disable the robber for testing purposes
    if(process.env['robber'] === 'disabled'){
        state_machine.game.robber = 'disabled';
    }

    if(process.env['dev_card'] !== 'disabled'){
        state_machine.development_cards = [];
        for(var i = 0; i < 30; i++){
            state_machine.development_cards.push(process.env['dev_card']);
        }
    }

    
    console.log('Number of games = ' + this.games.length);
    this.games[this.games.length - 1].game.add_player(player);

    // Notify the other players that a new player has joined
    state_machine.broadcast('player_joined', {
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
        console.log("Player."+player.id,"invoked game_update");
        logger.log('debug', "Player."+player.id,"invoked game_update");
        // state_machine function to be called
        state_machine.tick(data);
    });

    player.socket.on('disconnect', function() {
        state_machine.broadcast('player_quit', {
            message : player.name + ' has disconnected. Game Over.'
        });

        self.remove_game(state_machine);
    });
    /**************************************************/
    /*           Listener creation ends               */
    /**************************************************/

    // Start the game if we have all the players
    if (state_machine.game.game_full()) {
        state_machine.broadcast('game_start', {});
        //  Create the board and send it to the clients
        state_machine.broadcast('build_board', state_machine.game.buildBoard());
        state_machine.broadcast_gamestate();
        state_machine.game_start_sequence();
    }
};


/// Removes a game instance from the active games
Games.prototype.remove_game = function(state_machine) {
    var idx = this.games.indexOf(state_machine);
    this.games.splice(idx, 1);
};

/// Resets all the games - use for debugging
Games.prototype.hard_reset = function() {
    this.games = [];
    console.log('Games have been reset.');
};

/********************************************************/
/* General purpose functions for Games and StateMachine */
/********************************************************/
Games.prototype.set_test_flag = function (){
    return process.env['testing'];
}
module.exports = { Games };
