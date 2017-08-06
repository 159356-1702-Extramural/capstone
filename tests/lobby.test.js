/**
 * Unit tests for the lobby
 */
var test = require('ava');

var Lobby = require('../app/game/lobby.js');

test("When lobby is first created there is no game", function(t) {
    var lobby = new Lobby();
    t.is(lobby.games.length, 0);
});

test("Can add a new game to the lobby", function(t) {
    var lobby = new Lobby();
    lobby.add_game();
    t.is(lobby.games.length, 1);
});

test("Can add a multiple games to the lobby", function (t) {
    var lobby = new Lobby();
    lobby.add_game();
    lobby.add_game();
    lobby.add_game();
    t.is(lobby.games.length, 3);
});

test("Can remove a game instance from the lobby", function(t) {
    var lobby = new Lobby();
    lobby.add_game();
    lobby.remove_game(lobby.games[0]);
    t.is(lobby.games.length, 0);
});