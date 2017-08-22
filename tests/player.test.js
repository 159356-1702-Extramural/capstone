/**
 *  Tests for the Player
 */

var test = require('ava');
var Player = require('../app/data_api/player.js');

// Test variables
var socket;
var data;
var player;

// Set up player for each test
test.beforeEach(function(t) {
  socket = {};
  data = { name: 'Tim' };
  player = new Player(socket, data);
});

test("Should create a new player called Tim", function(t) {
    t.is(player.name, "Tim");
});

test("New player has a empty cards object", function(t) {
  t.is(player.cards.count_cards(), 0);
});

test("Cards can be added to the player", function (t) {
  player.cards.add_card('brick');
  player.cards.add_card('grain');
  player.cards.add_card('sheep');
  player.cards.add_card('lumber');
  player.cards.add_card('ore');
  t.is(player.cards.count_cards(), 5);
});

test("Cards can be removed from the player", function (t) {
  player.cards.add_card('brick');
  player.cards.add_card('grain');
  player.cards.add_card('sheep');
  player.cards.add_card('lumber');
  player.cards.add_card('ore');
  t.is(player.cards.count_cards(), 5);
  player.cards.remove_card('brick');
  player.cards.remove_card('grain');
  player.cards.remove_card('sheep');
  player.cards.remove_card('lumber');
  player.cards.remove_card('ore');
  t.is(player.cards.count_cards(), 0);
});