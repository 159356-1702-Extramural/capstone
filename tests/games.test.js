/**
 * Unit tests for the Games controller
 */
var test = require('ava');

var games = require('../app/game/games.js');
var sm = require('../app/game/state_machine.js');

var g;
var player = { name:"Test Player", game_name:"TEST"}
var mocket = {
  emit: function(d) {
    if (d == "game_full") game_full = true;
  },
  on: function() { }
};
var game_full = false;

test.beforeEach(t => {
  g = new games.Games();
  game_full = false;
});

test("Create new game with player", function(t) {
  g.new_game(mocket, player, 4);
  t.is(g.games.length, 1);
  t.is(g.games[0].game.name, "TEST");
});

test("Reset games to clean state", function(t) {
  g.new_game(mocket, player, 4);
  t.is(g.games.length, 1);
  g.hard_reset();
  t.is(g.games.length, 0);
});

test("New players can be assigned to a game except when game is full", function(t) {
  g.new_game(mocket, player, 4);
  t.is(g.games.length, 1);

  g.assign_player(mocket, { name: 'Paul', game_id: 0 });
  g.assign_player(mocket, { name: 'John', game_id: 0 });
  g.assign_player(mocket, { name: 'George', game_id: 0 });
  t.false(game_full);
  g.assign_player(mocket, { name: 'Ringo', game_id: 0 });
  t.true(game_full);
  t.is(g.games.length, 1);
});

test("Player assigned without testing data", function(t) {
  g.new_game(mocket, player, 4);
  t.is(g.games.length, 1);

  t.is(g.games[0].state, 'setup');
  t.is(g.games[0].setupComplete, false);
  t.is(g.games[0].setupPointer, 0);
  t.is(g.games[0].game.round_num,1);
});

test("Player assigned with testing data", function(t) {
  // environment variables set
  process.env.setup = 'skip';

  g.new_game(mocket, player, 4);
  t.is(g.games.length, 1);

  t.is(process.env.setup, 'skip');
  // TODO: test items on board to be sure
  t.is(g.games[0].setupComplete, true);
  t.is(g.games[0].setupPointer, 8);
  t.is(g.games[0].game.round_num,3);
});

test("Player assigned with testing data", function(t) {
  // environment variables set
  process.env.setup = 'skip';
  process.env.players = 4;
  process.env.robber = 'disabled';

  g.new_game(mocket, player, 4);
  t.is(g.games.length, 1);

  t.is(process.env.setup, 'skip');
  t.is(process.env.players, '4');
  t.is(process.env.robber, 'disabled');
  // TODO: test items on board to be sure
  t.is(g.games[0].setupComplete, true);
  t.is(g.games[0].setupPointer, 8);
  t.is(g.games[0].game.round_num,3);
});
