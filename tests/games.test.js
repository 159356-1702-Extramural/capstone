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
