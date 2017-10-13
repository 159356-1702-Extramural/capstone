/**
 * Unit tests for the Games controller
 */
var test = require('ava');

var games = require('../app/game/games.js');
var sm = require('../app/game/state_machine.js');
var Client_Data_package = require('../public/data_api/data_package.js');

var g;
var player = {
  name: "Test Player",
  game_name: "TEST"
}
// fake socket that catches messages sent to it
var game_full = false;
var lobby_data = null;
var game_data = null;
var player_quit = false;

function Socket() {
  //outgoing
  this.on = (event, func) => {
    if (event !== 'disconnect') { // don't want to run the disconnect callback
      if (typeof func === 'function') { func() }; // runs the callback
    }
  };
  //incoming
  this.emit = (event, data) => {
    if (event == "game_full") game_full = true;
    if (event == "lobby_data") lobby_data = data;
    if (event == "player_quit") player_quit = true;
    if (event == "game_turn") game_data = data;
  };
};


test.beforeEach(t => {
  g = new games.Games();
  game_full = false;
  lobby_data = null;
  game_data = null;
  player_quit = false;
});

test("Create new game with player", function (t) {
  g.new_game(new Socket(), player, 4);
  t.true(g.games[0] !== null);
  t.is(g.games[0].game.name, "TEST");
});

test("Reset games to clean state", function (t) {
  g.new_game(new Socket(), player, 4);
  t.true(g.games[0] !== null);
  g.hard_reset();
  t.is(g.games.length, 0);
});

test("New players can be assigned to a game except when game is full", function (t) {
  let result = g.new_game(new Socket(), player, 4);
  t.true(result);
  t.true(g.games[0] !== null);

  result = g.assign_player(new Socket(), {
    name: 'Paul',
    game_id: 0
  });
  t.true(result);
  result = g.assign_player(new Socket(), {
    name: 'John',
    game_id: 0
  });
  t.true(result);
  result = g.assign_player(new Socket(), {
    name: 'George',
    game_id: 0
  });
  t.true(result);
  t.false(game_full);

  result = g.assign_player(new Socket(), {
    name: 'Ringo',
    game_id: 0
  });
  t.false(result);
  t.true(game_full);
  t.true(g.games[0] !== null);
});

test("Can't assign player to non-existant game", function (t) {
  t.is(g.games.length, 0);
  let result = g.assign_player(new Socket(), {
    name: 'Paul',
    game_id: 0
  });
  t.false(result);
  t.true(game_full);
  t.is(g.games.length, 0);

  game_full = false;
  g.games[0] = null; // mimic removal of a game
  result = g.assign_player(new Socket(), {
    name: 'Paul',
    game_id: 0
  });
  t.false(result);
  t.true(game_full);
  t.is(g.games.length, 1);
});

test("Receive no lobby data for no new games, and data for one game", function (t) {
  g.send_lobby_data(new Socket());
  t.is(lobby_data.length, 0);

  g.new_game(new Socket(), player, 4);
  let result = g.assign_player(new Socket(), {
    name: 'Paul',
    game_id: 0
  });
  t.true(result);
  t.false(game_full);
  g.send_lobby_data(new Socket());
  t.is(lobby_data[0].game_id, 0);
  t.true(g.games[0] !== null);
});

test.serial("Sending game_update request recv data", function (t) {
  g.new_game(new Socket(), player, 2);
  g.assign_player(new Socket(), {
    player_id: 0,
    name: 'Paul',
    game_id: 0
  });
  g.assign_player(new Socket(), {
    player_id: 1,
    name: 'Saul',
    game_id: 0
  });
  t.true(g.games[0] !== null);

  g.games[0].state = 'play';
  var data_package = new Client_Data_package();
  data_package.data_type = 'turn_complete';

  data_package.player_id = 0;
  g.games[0].game.players[0].socket.on('game_update', data_package);
  data_package.player_id = 1;
  g.games[0].game.players[1].socket.on('game_update', data_package);

  t.truthy(game_data);
});

//Craig set to failing as game no longer removed on disconnect
test.failing("Player disconnect received and remove socket from lounge", function (t) {
  g.new_game(new Socket(), player, 2);
  t.true(g.games[0] !== null);
  let socket = new Socket();
  socket.on = (event, func) => {
      if (typeof func === 'function') { func() }; // run the returned player_quit func
  };
  g.lounging.push(socket);
  g.assign_player(socket, {
    id: 0,
    name: 'Paul',
    game_id: 0
  }); // the socket disconnects as soon as the var is killed
  t.true(g.games[0] === null);
  t.true(player_quit);
});

test("Player assigned without testing data", function (t) {
  g.new_game(new Socket(), player, 4);
  t.true(g.games[0] !== null);

  t.is(g.games[0].state, 'setup');
  t.is(g.games[0].setupComplete, false);
  t.is(g.games[0].setupPointer, 0);
  t.is(g.games[0].game.round_num, 1);
});

test("Player assigned with testing data", function (t) {
  // environment variables set
  process.env.setup = 'skip';

  g.new_game(new Socket(), player, 4);
  t.true(g.games[0] !== null);

  t.is(process.env.setup, 'skip');
  // TODO: test items on board to be sure
  t.is(g.games[0].setupComplete, true);
  t.is(g.games[0].setupPointer, 8);
  t.is(g.games[0].game.round_num, 3);
});

test("Player assigned with testing data", function (t) {
  // environment variables set
  process.env.setup = 'skip';
  process.env.players = 4;
  process.env.robber = 'disabled';
  process.env.testing = 'true';

  g.new_game(new Socket(), player, 4);
  t.true(g.games[0] !== null);
  t.true(g.set_test_flag() === 'true');

  t.is(process.env.setup, 'skip');
  t.is(process.env.players, '4');
  t.is(process.env.robber, 'disabled');
  t.is(process.env.testing, 'true');
  // TODO: test items on board to be sure
  t.is(g.games[0].setupComplete, true);
  t.is(g.games[0].setupPointer, 8);
  t.is(g.games[0].game.round_num, 3);
});
