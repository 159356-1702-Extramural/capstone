var logger = require('winston');

function Game(lobby) {
    
    // Reference to the game lobby
    this.lobby          = lobby;
    
    this.max_players    = 2;
    this.players        = [];

    this.game_full      = false;
    this.round_num      = 1;
    
    this.player_colours = ['#F44336', // Red
                           '#2196F3', // Blue
                           '#4CAF50', // Green
                           '#FFEB3B']; // Yellow
    
                           this.development_cards = [];
}

// Adds a player to the game
Game.prototype.add_player = function(player) {
    
    var _self = this;

    console.log('adding player');
 
    // Add player to the game
    this.players.push(player);

    // Store the player id
    player.id = this.players.indexOf(player);

    // Assign a color to this player
    player.colour = this.player_colours[player.id];
    
    player.socket.emit('player_id', { id : player.id });    

    // Listen for game updates from this socket
    player.socket.on('game_update', function(data) {
        _self.game_update(data);
    });

    // Listen for a disconnect - if any player disconnects we'll need
    // to terminate the game
    player.socket.on('disconnect', function() {
        _self.broadcast('game_error', {
            message : player.name + ' has disconnected. Game Over.'
        });

        _self.lobby.remove_game(this);
    });

    // Start the game if we have all the players
    if (this.players.length === this.max_players) {

        this.game_full = true;

        // Begin the game
        this.broadcast('game_start', {});
        this.broadcast_gamestate();
    }
        
    // Notify the other players that a new player has joined
    this.broadcast('player_joined', {
        player_count    : this.players.length,
        max_players     : this.max_players
    });
        
    console.log('Player number ' + (this.players.length) + ' has been added');
    return true;
};

/**
 * Handles an update event from the game
 */
Game.prototype.game_update = function(data) {
    this.players[data.player_id].turn_complete = true;
    
    // Determine if the round is complete, ie. all players have 
    // indicated their round is complete
    var round_complete = this.players.every(function(player) {
        return player.turn_complete === true;
    });
    
    if (round_complete) {
        this.process_round();
    }

    this.broadcast_gamestate();
};

/**
 * Game logic
 */
Game.prototype.process_round = function()
{
    // For now: increment round number and reset the player turn
    // completion status
    this.players.forEach(function(player) {
        player.turn_complete = false;
    });

    this.round_num = this.round_num + 1;
}

/**
 * Gathers up the state of the game and sends the current gamestate
 * to all the players contains all data to render the current state
 * of the game in the browser
 */
Game.prototype.broadcast_gamestate = function() {

    var players = this.players.map(function(player, idx) {
        return {
            id              : idx,
            name            : player.name,
            turn_complete   : player.turn_complete
        };
    });

    var game_data = {
        players   : players,
        round_num : this.round_num
    };

    this.broadcast('update_game', game_data);
};

/**
 * Messages all players in the game
 */
Game.prototype.broadcast = function(event_name, data) {

    console.log('Broadcasting event: ' + event_name);
    this.players.forEach(function(player) {                
        player.socket.emit(event_name, data);
    });
};

/*
 * Rolling two dices, and return the sum of the two dices number.
 */
Game.prototype.rollingDice=function () {
    var dice1=Math.ceil(Math.random() * 6 );
    var dice2=Math.ceil(Math.random() * 6 );
    return dice1+dice2;
}

module.exports = Game;