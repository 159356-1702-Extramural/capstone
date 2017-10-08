/**
 *  Tests for the Game
 */
var test = require('ava');

var Game = require('../app/game/game.js');
var StateMachine = require('../app/game/state_machine.js');
var BoardBuilder = require('../app/game/board_builder.js');
var Player = require('../app/data_api/player.js');

import {
  Point
} from '../public/data_api/board.js';

test("Game object can be created", function (t) {
  var game = new Game();
  t.truthy(game);
});

test("End of start sequence resources can be allocated", function (t) {

  var mock_data;
  var game = new Game();
  game.players[0] = new Player({}, {
    name: 'Tim'
  });
  game.players[0].id = 0;

  // Fake settlement placement
  mock_data = {
    actions: [{
      action_type: 'build_settlement',
      action_data: {
        n_tiles: [new Point(2, 2), new Point(3, 2), new Point(2, 3)]
      }
    }]
  };

  game.secondRoundResources(game.players[0], mock_data);

  var numCards = game.players[0].cards.count_cards();

  // Should be at least two cards
  // might be near a desert dependding on board generation
  t.truthy(numCards > 1);

});

test("Dice roll function returns a number between 2 and 12", function (t) {
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

// TODO: random board gen causes fail
test.todo("Test dice roll rescources have been allocated correctly.");

test("Reset turn status for all players", function (t) {
  var game = new Game();
  game.players[0] = new Player({}, {
    name: 'Tim'
  });
  game.players[0].id = 0;
  game.players[0].turn_complete = true;
  game.players[1] = new Player({}, {
    name: 'Tim #2'
  });
  game.players[1].id = 1;
  game.players[1].turn_complete = true;
  game.reset_player_turns();
  t.is(game.players[0].turn_complete, false);
  t.is(game.players[1].turn_complete, false);
});

test.todo("Confirm the robber prevents a tile from give up its resources");

test("Robber moves", function (t) {
  var game = new Game();

  game.players[0] = new Player({}, {
    id: 0,
    name: 'Tim',
  });
  game.players[0].id = 0;

  game.players[0].cards.add_card("brick");
  game.players[0].cards.add_card("lumber");
  game.board.set_item('build_settlement', 0, 0);

  var tiles = game.board.get_tiles_with_resource("lumber");
  game.board.nodes[tiles[0].associated_nodes[0]].owner = 0;
  game.board.nodes[tiles[1].associated_nodes[1]].owner = 0;
  game.board.nodes[tiles[2].associated_nodes[3]].owner = 0;

  var robber_start_x;
  var robber_start_y;

  var robber_end_x;
  var robber_end_y;

  var x;
  var y;

  var tiles = game.board.tiles;
  var tiles_row;

  // Work out current location of the robber
  for (x = 0; x < tiles.length; x++) {
    tiles_row = tiles[x];
    for (y = 0; y < tiles_row.length; y++) {
      if (tiles[x][y].robber) {
        robber_start_x = x;
        robber_start_y = y;
      }
    }
  }

  game.robPlayers();

  // Work out end location of the robber
  for (x = 0; x < tiles.length; x++) {
    tiles_row = tiles[x];
    for (y = 0; y < tiles_row.length; y++) {
      if (tiles[x][y].robber) {
        robber_end_x = x;
        robber_end_y = y;
      }
    }
  }

  // Robber has moved
  t.true(!tiles[robber_start_x][robber_start_y].robber && tiles[robber_end_x][robber_end_y].robber);

});

test("Player with 0 resource doesn't get robbed", function (t) {
  var game = new Game();

  game.players[0] = new Player({}, {
    name: 'Tim'
  });
  game.players[0].id = 0;

  var start_cards = game.players[0].cards.count_cards();

  game.robPlayers();

  var end_cards = game.players[0].cards.count_cards();

  t.true(start_cards == end_cards);
});

test("Player with 6 resources gets 1 card robbed", function (t) {
  var game = new Game();

  game.players[0] = new Player({}, {
    name: 'Tim'
  });
  game.players[0].id = 0;
  game.players[0].cards.add_cards("lumber", 1);
  game.players[0].cards.add_cards("sheep", 1);

  var tiles = game.board.get_tiles_with_resource("lumber");
  game.board.nodes[tiles[0].associated_nodes[0]].owner = 0;
  game.board.nodes[tiles[1].associated_nodes[1]].owner = 0;
  game.board.nodes[tiles[2].associated_nodes[3]].owner = 0;
  var tiles = game.board.get_tiles_with_resource("sheep");
  game.board.nodes[tiles[0].associated_nodes[0]].owner = 0;
  game.board.nodes[tiles[1].associated_nodes[1]].owner = 0;
  game.board.nodes[tiles[2].associated_nodes[3]].owner = 0;

  var start_cards = game.players[0].cards.count_cards();

  game.robPlayers();

  var end_cards = game.players[0].cards.count_cards();
  var round_cards = game.players[0].round_distribution_cards.count_cards();

  t.true(start_cards == 6 && end_cards == 5);
  t.true(round_cards === -1);
});

test("Player with 9 cards get 4 cards robbed", function (t) {
  var game = new Game();
  var cards = ["brick", "lumber", "grain", "sheep", "ore", "brick", "brick", "lumber", "grain"];
  game.players[0] = new Player({}, {
    name: 'Tim'
  });
  game.players[0].id = 0;

  for (var i = 0; i < cards.length; i++) {
    game.players[0].cards.add_card(cards[i]);
  }
  var start_cards = game.players[0].cards.count_cards();

  game.robPlayers();
  var end_cards = game.players[0].cards.count_cards();
  var round_cards = game.players[0].round_distribution_cards.count_cards();

  t.true(start_cards == 9 && end_cards == 5);
  t.true(round_cards === -4);
});

test("Player gets longest_road bonus", function (t) {
  var game = new Game();
  var player0_roads = [0, 1, 2, 3, 4, 5];
  game.players[0] = new Player({}, {
    name: 'John'
  });
  game.players[0].id = 0;

  // Give player 0 some roads
  for (var i = 0; i < player0_roads.length; i++) {
    game.board.set_item("build_road", player0_roads[i], game.players[0].id);
  }

  game.modifyPlayerWithRoadBonus();
  t.true(game.players[0].score.longest_road);
  t.true(game.players[0].score.road_length === 5);
});

test("No players recieve road bonus in same turn if same length longest roads", function (t) {
  var game = new Game();
  var player0_roads = [0, 1, 2, 3, 4, 5];
  var player1_roads = [8, 9, 10, 11, 12, 13];
  game.players[0] = new Player({}, {
    name: 'John'
  });
  game.players[0].id = 0;
  game.players[1] = new Player({}, {
    name: 'Paul'
  });
  game.players[1].id = 1;

  // Give player 0 some roads
  for (var i = 0; i < player0_roads.length; i++) {
    game.board.set_item("build_road", player0_roads[i], game.players[0].id);
  }
  // Give player 1 some roads
  for (var i = 0; i < player1_roads.length; i++) {
    game.board.set_item("build_road", player1_roads[i], game.players[1].id);
  }

  game.modifyPlayerWithRoadBonus();
  t.false(game.players[0].score.longest_road);
  t.true(game.players[0].score.road_length === 5);
  t.false(game.players[1].score.longest_road);
  t.true(game.players[1].score.road_length === 5);
});

test("Player 0 retains longest road in next turn after player 1 matches length", function (t) {
  var game = new Game();
  var player0_roads = [0, 1, 2, 3, 4, 5];
  var player1_roads = [8, 9, 10, 11, 12, 13];
  game.players[0] = new Player({}, {
    name: 'John'
  });
  game.players[0].id = 0;
  game.players[1] = new Player({}, {
    name: 'Paul'
  });
  game.players[1].id = 1;

  // Give player 0 some roads
  for (var i = 0; i < player0_roads.length; i++) {
    game.board.set_item("build_road", player0_roads[i], game.players[0].id);
  }
  // effectively turn over
  game.modifyPlayerWithRoadBonus();
  // Give player 1 some roads
  for (var i = 0; i < player1_roads.length; i++) {
    game.board.set_item("build_road", player1_roads[i], game.players[1].id);
  }

  game.modifyPlayerWithRoadBonus();
  t.true(game.players[0].score.longest_road);
  t.true(game.players[0].score.road_length === 5);
  t.false(game.players[1].score.longest_road);
  t.true(game.players[1].score.road_length === 5);
});

test("Player gets road of 15 long in complex loop", function (t) {
  var game = new Game();
  var complex = [29, 17, 13, 5, 1, 0, 2, 10, 12, 14, 26, 28, 15, 16, 21, 31];
  game.players[0] = new Player({}, {
    name: 'John'
  });
  game.players[0].id = 0;

  // Build complex road
  for (var i = 0; i < complex.length; i++) {
    game.board.set_item("build_road", complex[i], game.players[0].id);
  }

  game.modifyPlayerWithRoadBonus();
  t.true(game.players[0].score.longest_road);
  t.true(game.players[0].score.road_length === 15);
});

test("Player receives largest army bonus", function (t) {
  var game = new Game();

  game.players[0] = new Player({}, {
    name: 'John'
  });
  game.players[0].id = 0;
  game.players[0].cards.dev_cards.knight_played = 3;

  game.modifyPlayerWithArmyBonus();
  t.true(game.players[0].score.largest_army);
});

test("No players receive army bonus if same army size in the same turn", function (t) {
  var game = new Game();

  game.players[0] = new Player({}, {
    name: 'Rue'
  });
  game.players[0].id = 0;
  game.players[0].cards.dev_cards.knight_played = 3;
  game.players[1] = new Player({}, {
    name: 'Paul'
  });
  game.players[1].id = 1;
  game.players[1].cards.dev_cards.knight_played = 3;

  game.modifyPlayerWithArmyBonus();
  t.false(game.players[0].score.largest_army);
  t.false(game.players[1].score.largest_army);
});

test("New player gets largest army after previous player", function (t) {
  var game = new Game();

  game.players[0] = new Player({}, {
    name: 'Rue'
  });
  game.players[0].id = 0;
  game.players[0].cards.dev_cards.knight_played = 3;
  game.players[1] = new Player({}, {
    name: 'Paul'
  });
  game.players[1].id = 1;
  game.modifyPlayerWithArmyBonus();
  t.true(game.players[0].score.largest_army);
  t.false(game.players[1].score.largest_army);

  game.players[1].cards.dev_cards.knight_played = 3;
  game.modifyPlayerWithArmyBonus();

  t.false(game.players[0].score.largest_army);
  t.true(game.players[1].score.largest_army);
});

test("Starting players have no score", function (t) {
  var game = new Game();

  game.players[0] = new Player({}, {
    name: 'John'
  });
  game.players[0].id = 0;

  game.players[1] = new Player({}, {
    name: 'Paul'
  });
  game.players[1].id = 1;

  game.players[2] = new Player({}, {
    name: 'John'
  });
  game.players[2].id = 2;

  game.players[3] = new Player({}, {
    name: 'Ringo'
  });
  game.players[3].id = 3;

  game.calculateScores();

  t.true(game.players[0].score.total_points === 0);
  t.true(game.players[1].score.total_points === 0);
  t.true(game.players[2].score.total_points === 0);
  t.true(game.players[3].score.total_points === 0);
});

test("Player scores correctly totalled", function (t) {
  var game = new Game();

  game.players[0] = new Player({}, {
    name: 'John'
  });
  game.players[0].id = 0;

  game.players[1] = new Player({}, {
    name: 'Paul'
  });
  game.players[1].id = 1;

  game.players[2] = new Player({}, {
    name: 'John'
  });
  game.players[2].id = 2;

  game.players[3] = new Player({}, {
    name: 'Ringo'
  });
  game.players[3].id = 3;

  // Give player 0 some points
  game.board.set_item("build_road", 0, game.players[0].id);
  game.board.set_item("build_road", 1, game.players[0].id);
  game.board.set_item("build_road", 2, game.players[0].id);
  game.board.set_item("build_road", 3, game.players[0].id);
  game.board.set_item("build_road", 4, game.players[0].id);
  game.board.set_item("build_road", 5, game.players[0].id);

  // Give player 1 some points
  game.players[1].cards.victory_point_cards.library = 1;
  game.players[1].cards.victory_point_cards.market = 1;
  game.players[1].cards.victory_point_cards.chapel = 1;
  game.players[1].cards.victory_point_cards.university_of_catan = 1;
  game.players[1].cards.victory_point_cards.great_hall = 1;
  game.players[1].cards.dev_cards.knight_played = 3;

  // Give player 2 some buildings
  game.board.set_item('build_settlement', 0, 2);
  game.board.set_item('build_settlement', 1, 2);
  game.board.set_item('build_settlement', 3, 2);

  // Player 3 - no points for you

  game.calculateScores();

  t.true(game.players[0].score.total_points === 2);
  t.true(game.players[1].score.total_points === 7);
  t.true(game.players[2].score.total_points === 3);
  t.true(game.players[3].score.total_points === 0);
});

test("Winning player detected", function (t) {
  var game = new Game();

  game.players[0] = new Player({}, {
    name: 'John'
  });
  game.players[0].id = 0;

  game.players[1] = new Player({}, {
    name: 'Paul'
  });
  game.players[1].id = 1;

  game.players[2] = new Player({}, {
    name: 'John'
  });
  game.players[2].id = 2;

  game.players[3] = new Player({}, {
    name: 'Ringo'
  });
  game.players[3].id = 3;

  // Give player 0 some points
  game.players[0].score.longest_road = true;
  game.players[0].score.largest_army = false;

  // Give player 1 enough points to win
  game.players[1].score.longest_road = false;
  game.players[1].score.largest_army = true;
  game.players[1].cards.victory_point_cards.library = 1;
  game.players[1].cards.victory_point_cards.market = 1;
  game.players[1].cards.victory_point_cards.chapel = 1;
  game.players[1].cards.victory_point_cards.university_of_catan = 1;
  game.players[1].cards.victory_point_cards.great_hall = 1;

  game.board.set_item('build_settlement', 4, 1);
  game.board.set_item('build_settlement', 5, 1);
  game.board.set_item('build_settlement', 6, 1);

  // Give player 2 some buildings
  game.board.set_item('build_settlement', 0, 2);
  game.board.set_item('build_settlement', 1, 2);
  game.board.set_item('build_settlement', 3, 2);

  game.calculateScores();

  t.true(game.players[1].score.total_points === 10);
  t.true(game.haveWinner());

});

test("No winnner found", function (t) {
  var game = new Game();

  game.players[0] = new Player({}, {
    name: 'John'
  });
  game.players[0].id = 0;

  game.players[1] = new Player({}, {
    name: 'Paul'
  });
  game.players[1].id = 1;

  game.players[2] = new Player({}, {
    name: 'John'
  });
  game.players[2].id = 2;

  game.players[3] = new Player({}, {
    name: 'Ringo'
  });
  game.players[3].id = 3;

  // Give player 0 some points
  game.players[0].score.longest_road = true;
  game.players[0].score.largest_army = false;

  // Give player 1 enough points to win
  game.players[1].score.longest_road = false;
  game.players[1].score.largest_army = true;
  game.players[1].cards.victory_point_cards.library = 1;
  game.players[1].cards.victory_point_cards.market = 1;
  game.players[1].cards.victory_point_cards.chapel = 1;
  game.players[1].cards.victory_point_cards.university_of_catan = 1;
  game.players[1].cards.victory_point_cards.great_hall = 1;

  game.board.set_item('build_settlement', 4, 1);
  game.board.set_item('build_settlement', 5, 1);

  // Give player 2 some buildings
  game.board.set_item('build_settlement', 0, 2);
  game.board.set_item('build_settlement', 1, 2);
  game.board.set_item('build_settlement', 3, 2);

  game.calculateScores();

  t.true(game.players[1].score.total_points === 9);
  t.true(!game.haveWinner());

});

test("Randomised array returned", function (t) {
  var game = new Game();
  var randomised_array = game.randomise_startup_array(4);

  t.is(randomised_array.length, 8);
  t.truthy(randomised_array !== [0, 1, 2, 3, 3, 2, 1, 0]);
});

/*
TODO
test("Set player number", function(t) {
  var game = new Game();
  var state_machine = new StateMachine.StateMachine();
  game.state_machine = state_machine;
  process.env['players'] = 2;
  t.is(game.state_machine.setupSequence.length, 4);

  process.env['players'] = 4;
  t.is(game.set_player_number(), 4);
  t.is(game.state_machine.setupSequence.length, 8);
});
*/
test("Set player number2", function (t) {
  var game = new Game();
  game.dice_array = game.fixed_dice_rolls();
  /**
   * round number = 1
   * var dice1array = [1,2,3,4,5,6];
   * dice2 = 4
   * total = dice1Array[1] + dice2 = 2 + 4 = 6
   */
  var dice_total = game.rollingDice();
  t.is(dice_total, 5);
  t.is(game.dice_roll[0], 1);
  t.is(game.dice_roll[1], 4);
});

test("Return a development card to the pack", function (t) {
  var game = new Game();

  var dev_card_original_length = game.cards.length;
  game.return_dev_card("knight");
  t.is(game.cards.length, dev_card_original_length + 1);
  t.truthy(game.cards[game.cards.length - 1], "knight");

});

test("Use knight decrements players knights cards", function (t) {

  var state_machine = new StateMachine.StateMachine(0);

  var mockSocket = {
    emit: function () {},
    on: function () {}
  };

  state_machine.game.add_player(new Player(mockSocket, {
    name: 'John'
  }));

  state_machine.game.players[0].cards.dev_cards.knight++;

  // Confirm the the player has one knight card and no ore resource
  t.is(state_machine.game.players[0].cards.dev_cards.knight, 1);
  t.is(state_machine.game.players[0].cards.dev_cards.knight_played, 0);
  t.is(state_machine.game.players[0].cards.resource_cards.ore, 0);

  // Simulate the request
  state_machine.useKnight({
    player_id: 0,
    resource: 'ore'
  });

  // Confirm the the player no longer has the knight
  t.is(state_machine.game.players[0].cards.dev_cards.knight, 0);
  t.is(state_machine.game.players[0].cards.dev_cards.knight_played, 1);
  t.is(state_machine.game.players[0].cards.resource_cards.ore, 1);

});

test("Knight moves the robber to a new location", function (t) {

  var robber_start_idx;
  var robber_end_idx;

  var state_machine = new StateMachine.StateMachine(0);

  var mockSocket = {
    emit: function () {},
    on: function () {}
  };

  state_machine.game.add_player(new Player(mockSocket, {
    name: 'John'
  }));
  state_machine.game.add_player(new Player(mockSocket, {
    name: 'Paul'
  }));

  state_machine.game.board.resourceTiles.forEach(function (tile, i) {
    if (tile.robber) {
      robber_start_idx = i;
    }
  }, this);

  state_machine.game.knightMoveRobber(0);

  state_machine.game.board.resourceTiles.forEach(function (tile, i) {
    if (tile.robber) {
      robber_end_idx = i;
    }
  }, this);

  t.not(robber_start_idx, robber_end_idx);

});
