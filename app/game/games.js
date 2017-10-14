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
  this.lounging = [];
};

/**
 * Adds the player to the specified game in player.game_id
 * @param {obj} socket
 * @param {obj} data
 */

// TODO: Rework this function to
Games.prototype.assign_player = function (socket, data) {
  self = this;
  var lounger_idx = this.lounging.indexOf(socket);
  if (lounger_idx >= 0)
    this.lounging.splice(lounger_idx, 1);

  if (!this.games[data.game_id]) {
    logger.log('info', 'Player tried to join a non-existant game');
    // TODO: send new message over socket for nil game
    this.send_lobby_data(socket);
    socket.emit('game_full');
    return false;
  }
  if (this.games[data.game_id].game.game_full()) {
    logger.log('info', 'Player tried to join full game');
    // TODO: send something over socket
    this.send_lobby_data(socket);
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

  //  Build some html to show each player
  var player_html = "";
  for (var i = 0; i < state_machine.game.max_players; i++) {
    player_html += "<div class='player_waiting_row'>";
    player_html += "  <div class='player_waiting_icon'><img src='images/player" + i + ".png' /></div>";
    if (i > state_machine.game.players.length - 1) {
      player_html += "  <div class='player_waiting_name'>Waiting...<i class='fa fa-spinner fa-spin'></i></div>";
    } else {
      player_html += "  <div class='player_waiting_name'>" + state_machine.game.players[i].name + "</div>";
    }
    player_html += "</div>";
  }

  // Notify the other players that a new player has joined
  state_machine.broadcast('player_joined', {
    player_count: state_machine.game.players.length,
    max_players: state_machine.game.max_players,
    player_list: player_html
  });
  /**************************************************/
  /*    Create listeners on sockets for messages    */
  /**************************************************/
  player.socket.on('game_update', function (data) {
    logger.log('info', "SM#"+state_machine.id+": "+player.name+" invoked game_update");
    // state_machine function to be called
    state_machine.tick(data);
  });

  player.socket.on('disconnect', function () {
    logger.log('info', 'a player has quit the game');
    // state_machine.broadcast('player_quit', {
    //   message: player.name + ' has disconnected. Game Over.'
    // });
    player.connected = false;

    //check if all players are disconnected from the game
    var players = state_machine.game.players;
    var disconnected = true;
    for(var i = 0; i < players.length; i++){
      if(players[i].connected){
        disconnected = false;
        break;
      }
    }

    if(disconnected){
      self.remove_game(player.game_id);
      logger.log("warning", "All players have left the game");
    }else{
      var data_package = {
        data_type: "turn_complete",
        player_id: player.id,
        actions: []
      }
      if(state_machine.game.round_num < 3){
        //still in setup phase
        data_player.actions = state_machine.computer_player_setup();
      }
      state_machine.tick(data_package);
    }
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
  for (var x=0; x< this.lounging.length; x++) {
    this.send_lobby_data(this.lounging[x]);
  }
  return true;
};

/// Removes a game instance from the active games
Games.prototype.remove_game = function (idx) {
  self = this;
  self.games[idx] = null;
  for (var x=0; x< this.lounging.length; x++) {
    this.send_lobby_data(this.lounging[x]);
  }
  logger.log('info', "game "+idx+" is now "+this.games[idx]);
};

/// Resets all the games - use for debugging
Games.prototype.hard_reset = function () {
  this.games = [];
  logger.log('debug', 'Games have been reset.');
};

Games.prototype.send_lobby_data = function (socket) {
  var games = [];
  for (var i = 0; i < this.games.length; i++) {
    if (this.games[i] !== null) {
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
  }
  logger.log('debug', "Current lobby data = \n", games);
  socket.emit("lobby_data", games);
};

Games.prototype.new_game = function (socket, data, game_size) {
  var this_id = this.games.length;
  // todo: reset array if all null
  for (var g=0; g< this.games.length; g++) {
    if (this.games[g] === null) {
      this_id = g;
      break;
    }
  }
  var player = new Player(socket, data);
  logger.log('info', '\nCreating an new game "'+player.game_name+'"');

  var state_machine = new sm.StateMachine(this_id, game_size);
  player.game_id = this_id;
  state_machine.game.name = player.game_name;
  this.parse_env(state_machine);
  this.games[this_id] = state_machine;

  state_machine.game.max_players = game_size;
  state_machine.setupSequence = state_machine.game.randomise_startup_array();
  state_machine.dice_array

  state_machine.game.test_mode = this.set_test_flag();
  if(state_machine.game.test_mode === 'true'){
    state_machine.game.dice_array = state_machine.game.fixed_dice_rolls();
  }
  return this.assign_player(socket, player);
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
    state_machine.game.cards = [];
    for (var i = 0; i < 30; i++) {
      state_machine.game.cards.push(process.env['dev_card']);
    }
  }
};

/********************************************************/
/* General purpose functions for Games and StateMachine */
/********************************************************/
Games.prototype.set_test_flag = function () {
  if(process.env['testing'] === 'true'){
    return 'true';
  }else{
    return 'false';
  }
};
module.exports = {
  Games
};
