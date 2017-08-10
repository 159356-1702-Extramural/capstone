/**
 *  Tests for the Game
 */
var test = require('ava');

var Game = require('../app/game/game.js');

test("Game object can be created", function(t) {
    var game = new Game();
    t.truthy(game);
});

test("Dice roll is between 2 and 12",function (t) {
    var dice = Game.prototype.rollingDice();
    t.true(dice >= 2 && dice <= 12);
});