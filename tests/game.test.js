/**
 *  Tests for the Game
 */
var test = require('ava');

var Game = require('../app/game/game.js');

test("Game object can be created", function(t) {
    var game = new Game();
    t.truthy(game);
});

/*
 *test for the rolling dices method
*/
var game=require('../app/game/game.js');
test("Rolling dices",function (t) {
    var dice=game.prototype.rollingDice();
    t.true(dice>=2 &&dice<=12);
});