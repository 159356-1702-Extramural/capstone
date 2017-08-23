/**
 *  Tests for the Game
 */
var test = require('ava');

var Game = require('../app/game/game.js');
var BoardBuilder = require('../app/game/board_builder.js');
var Player = require('../app/data_api/player.js');

import { Point } from '../public/data_api/board.js';

test("Game object can be created", function(t) {
    var game = new Game();
    t.truthy(game);
});

test("End of start sequence resources can be allocated", function(t) {

  var mock_data;
  var game = new Game();
  game.players[0] = new Player({}, { name: 'Tim'});
  game.players[0].id = 0;

  // Fake settlement placement
  mock_data = {
    actions: [
      {
        action_type: 'build_settlement',
        action_data: {
          n_tiles: [new Point(2,2), new Point(3,2), new Point(2,3)]
        }
      }
    ]
  };

  game.secondRoundResources(game.players[0], mock_data);

  var numCards = game.players[0].cards.count_cards();

  // Should be at least two cards
  // might be near a desert dependding on board generation
  t.truthy(numCards > 1);

});

test("Dice roll function returns a number between 2 and 12", function(t) {
  var game = new Game();
  var result = game.rollingDice();
  t.true(result >= 2 && result <= 12);
});

test("Individual rolls are added to the game object", function (t) {
  var game = new Game();
  game.rollingDice();
  t.true(game.dice_roll.length == 2);
  t.true(game.dice_roll[0] >= 1 && game.dice_roll[0] <= 6);
  t.true(game.dice_roll[1] >= 1 && game.dice_roll[1] <= 6);
});

test("Test dice roll rescources have been allocated correctly.", function(t) {
  var game = new Game();

  game.players[0] = new Player({}, { name: 'Tim' });
  game.players[0].id = 0;

  game.board.set_item('build_settlement', 19, 0);

  game.allocateDicerollResources(6);

  t.true(game.players[0].cards.resource_cards.ore === 1);
  t.true(game.players[0].round_distribution_cards.resource_cards.ore === 1);

});