/**
 * Unit tests for the lobby
 */
var test = require('ava');

var Lobby = require('../game/lobby.js');

test("Creating the Lobny includes a Game", function(t) {
    var lobby = new Lobby();
    t.truthy(lobby.game);
});