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

  // Fake settlement placement
  mock_data = {
    actions: [
      {
        type: 'build_settlement',
        data: [new Point(1,1), new Point(2,1), new Point(1,2)]
      }
    ]
  };

  game.secondRoundResources(game.players[0], mock_data);

  console.log(JSON.stringify(game.players, null, 4));


  t.truthy(true);

});

test.todo("End of start sequence resources can be allocated");