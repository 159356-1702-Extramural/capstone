/**
 * Unit tests for the state machine
 */
var test = require('ava');

var sm              = require('../app/game/state_machine.js');
var Data_package    = require('../app/data_api/data_package.js');
var Player          = require('../app/data_api/player.js');

test("A statemachine when created also creates an empty game", function(t) {
    var machine = new sm.StateMachine(0);
    t.is(machine.id, 0);
    t.truthy(machine.game);
});