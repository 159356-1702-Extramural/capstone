/**
 * Unit tests for the Games controller
 */
var test = require('ava');

var games = require('../app/game/games.js');
var sm = require('../app/game/state_machine.js');

test("A new Games object contains an empty array", function(t) {
    var g = new games.Games();
    t.truthy(g);
    t.is(g.games.length, 0);
});

test("Insert and remove a state_machine in to Games.games[]", function(t) {
    var g = new games.Games();
    var m = new sm.StateMachine(0);
    t.truthy(g);
    t.truthy(m);
    t.is(g.games.length, 0);
    g.games.push(m);
    t.is(g.games.length, 1);
    g.remove_game(m);
    t.is(g.games.length, 0);
});

test("Reset games to clean state", function(t) {
    var g = new games.Games();
    var m = new sm.StateMachine(0);
    g.games.push(m);
    t.is(g.games.length, 1);
    g.hard_reset();
    t.is(g.games.length, 0);
});

test("Player can be assigned to a game", function(t) {
  var g = new games.Games();

  var mockSocket = {
    emit: function() { },
    on: function() {}
  };

  g.assign_player(mockSocket, {name: 'Tim'});

  t.is(g.games.length, 1);

  g.assign_player(mockSocket, { name: 'Paul' });
  g.assign_player(mockSocket, { name: 'John' });
  g.assign_player(mockSocket, { name: 'George' });
  g.assign_player(mockSocket, { name: 'Ringo' });

  // HACK: cuurent game maxsiz it 2, when this is changed to 4 this test
  // will ned to be changed
  t.is(g.games.length, 3);
});