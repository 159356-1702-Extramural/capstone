/**
 *  Tests for the Player
 */

var test = require('ava');

var Player = require('../app/game/player.js');

test("Should create a new player called Tim", function(t) {
    var socket = {};
    var data   = { name:  'Tim'};
    var player = new Player(socket, data);
    t.is(player.name, "Tim");
});