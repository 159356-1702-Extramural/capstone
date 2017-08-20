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
  game.players[0].id = 1;

  // Fake settlement placement
  mock_data = {
    actions: [
      {
        action_type: 'build_settlement',
        action_data: [new Point(2,2), new Point(3,2), new Point(2,3)]
      }
    ]
  };

  game.secondRoundResources(game.players[0], mock_data);
  
  var numCards = game.players[0].cards.count_cards();

  t.truthy(numCards > 0);

});

test.todo("End of start sequence resources can be allocated");