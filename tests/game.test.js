/**
 *  Tests for the Game
 */
var test = require('ava');

var Game = require('../app/game/game.js');

test("Game object can be created", function(t) {
    var game = new Game();
    t.truthy(game);
});

