/**
 * Unit tests for the lobby
 */
var test = require('ava');

var state_machine = require('../app/game/state_machine.js');

test("When lobby is first created there is no game", function(t) {
    var games = new state_machine.Games();
    t.is(games.games.length, 0);
});

test("Dice roll is between 2 and 12",function (t) {
    var dice = state_machine.rollingDice();
    t.true(dice >= 2 && dice <= 12);
});
