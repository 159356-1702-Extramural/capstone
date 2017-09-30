var logger = require('winston');
var Player = require('../data_api/player.js');
var sm = require("./state_machine.js");
var Chat = require('./chat.js');

/********************************************************
 * Games was Lobby - renamed to suit task
 *
 * The primary task here is to funnel players in to games,
 * link socket requests, and to manage games
 ********************************************************/

function Games() {
  this.games = []; // array of StateMachine objects, each corrosponds to one started game
};

/**
 * Adds the player to the specified game in player.game_id
 * @param {obj} socket
 * @param {obj} data
 */

// TODO: Rework this function to
Games.prototype.assign_player = function (socket, data) {
  self = this;
  if (this.games[data.game_id].game.game_full()) {
    console.log('Player tried to join full game');
    // TODO: send something over socket
    socket.emit('game_full');
    return false;
  }

  var player = new Player(socket, data);
  // add 20 of each resource to player's hand for testing
  var addTestCards = parseInt(process.env['startWithCards']);
  if (addTestCards !== 0) {
    player.cards.add_cards('ore', addTestCards);
    player.cards.add_cards('sheep', addTestCards);
    player.cards.add_cards('brick', addTestCards);
    player.cards.add_cards('grain', addTestCards);
    player.cards.add_cards('lumber', addTestCards);
  }
  var state_machine = this.games[player.game_id];
  state_machine.game.add_player(player);

  // Notify the other players that a new player has joined
  state_machine.broadcast('player_joined', {
    player_count: state_machine.game.players.length,
    max_players: state_machine.game.max_players
  });
  /**************************************************/
  /*    Create listeners on sockets for messages    */
  /**************************************************/
  player.socket.on('game_update', function (data) {
    logger.log('debug', "SM#"+state_machine.id+": "+player.name+" invoked game_update");
    // state_machine function to be called
    state_machine.tick(data);
  });

  player.socket.on('disconnect', function () {
    state_machine.broadcast('player_quit', {
      message: player.name + ' has disconnected. Game Over.'
    });

    self.remove_game(state_machine);
  });

  // Start the game if we have all the players
  if (state_machine.game.game_full()) {
    logger.log('info', 'Game #' + state_machine.id + " started");
    state_machine.broadcast('game_start', {});
    //  Create the board and send it to the clients
    state_machine.broadcast('build_board', state_machine.game.buildBoard());
    state_machine.broadcast_gamestate();
    state_machine.game_start_sequence();
    state_machine.chat = new Chat(state_machine.game.players);
    logger.log('info', 'Start of #' + state_machine.id + " completed");
  }
};

/// Removes a game instance from the active games
Games.prototype.remove_game = function (state_machine) {
  var idx = this.games.indexOf(state_machine);
  this.games.splice(idx, 1);
};

/// Resets all the games - use for debugging
Games.prototype.hard_reset = function () {
  this.games = [];
  logger.log('debug', 'Games have been reset.');
};

Games.prototype.send_lobby_data = function (socket) {
  logger.log('info', "Lobby data requested");
  var games = [];
  for (var i = 0; i < this.games.length; i++) {
    var game_data = {
      game_id: i,
      game_name: this.games[i].game.name,
      player_names: [],
      max_players: this.games[i].game.max_players,
    };
    for (var x = 0; x < this.games[i].game.players.length; x++) {
      game_data.player_names.push(this.games[i].game.players[x].name);
    }
    games.push(game_data);
  }
  logger.log('debug', "Current lobby data = \n", games);
  socket.emit("lobby_data", games);
};

Games.prototype.new_game = function (socket, data, game_size) {
  var player = new Player(socket, data);
  logger.log('info', '\nCreating an new game "'+player.game_name+'"');

  var state_machine = new sm.StateMachine(this.games.length, game_size);
  player.game_id = this.games.length;
  state_machine.game.name = player.game_name;
  this.parse_env(state_machine);
  this.games.push(state_machine);

  state_machine.game.max_players = game_size;
  state_machine.setupSequence = state_machine.game.randomise_startup_array();

  if (state_machine.game.test_mode === 'false') {
    state_machine.game.test_mode = this.set_test_flag();
  }
  logger.log('info', 'Number of games = ' + this.games.length);
  this.assign_player(socket, player);
};

Games.prototype.parse_env = function (state_machine) {
  // add settlements and roads, skipping setup phase for testing purposes
  if (process.env['setup'] === 'skip') {
    state_machine.setupComplete = true;
    state_machine.setupPointer = 8;
    state_machine.game.round_num = 3;

    var node_road_pairs = [
      [7, 9],
      [22, 29],
      [37, 36],
      [44, 63],
      [13, 21],
      [53, 70],
      [39, 56],
      [46, 62]
    ];

    var used = [];
    var rand = Math.floor(Math.random() * node_road_pairs.length);
    for (var p = 0; p < state_machine.game.max_players; p++) {
      for (var x = 0; x < 2; x++) {
        do {
          rand = Math.floor(Math.random() * node_road_pairs.length);
        } while (used.indexOf(rand) !== -1);
        used.push(rand);
        var pair = node_road_pairs[rand];
        state_machine.game.board.set_item('build_settlement', pair[0], p);
        state_machine.game.board.set_item('build_road', pair[1], p);
      }
    }
  }

  // disable the robber for testing purposes
  if (process.env['robber'] === 'disabled') {
    state_machine.game.robber = 'disabled';
  }

  if (process.env['dev_card'] !== 'disabled') {
    state_machine.game.development_cards = [];
    for (var i = 0; i < 30; i++) {
      state_machine.game.development_cards.push(process.env['dev_card']);
    }
  }
};

/********************************************************/
/* General purpose functions for Games and StateMachine */
/********************************************************/
Games.prototype.set_test_flag = function () {
  return process.env['testing'];
};
module.exports = {
  Games
};
