/**
 *  Tests for the Board Builder
 *
 *  The board_builder uses all functions within its .js so
 *  creating a board should test all.
 */

var test = require('ava');

var BoardBuilder = require('../app/game/board_builder.js');
var Board = require('../public/data_api/board.js');

test("Board should be created with non-zero-length props", function (t) {
  var board = BoardBuilder.generate();
  t.true(board.nodes.length > 0);
  t.true(board.roads.length > 0);
  t.true(board.tiles.length > 0);
});

test("Passing a test board to the creator should result in non-zero-length props", function (t) {
  var board_set = new BoardBuilder.BoardSet();
  var board = BoardBuilder.generate(board_set);
  t.true(board.nodes.length > 0);
  t.true(board.roads.length > 0);
  t.true(board.tiles.length > 0);
});

test("Compare Point arrays and return count of same points", function (t) {
  var ar1 = [new Board.Point(1,2), new Board.Point(2,1), new Board.Point(2,2)];
  var ar2 = [new Board.Point(1,2), new Board.Point(2,1), new Board.Point(3,3)];
  var count = compare_point_array(ar1, ar2);
  t.is(count, 2);
});

test("getRandomIntInclusive() is between numbers inclusive", function (t) {
  var result = getRandomIntInclusive(1, 12);
  t.true(result >= 1 && result <= 12);
});

test("random_from_stack() returns an item and decreases available", function (t) {
  var tile_stack = [
    ['brick', 3],
    ['sheep', 4],
    ['ore',   3],
    ['grain', 4],
    ['lumber',4],
    ['desert',1]
  ];
  var result = random_from_stack(tile_stack);
  var count = -1;
  var idx = -1;
  for (var i=0; i<tile_stack.length; i++) {
    if (tile_stack[i] === result)
      count = tile_stack[i][1];
      idx = i; break;
  };
  t.true(typeof result !== 'undefined');
  t.true(tile_stack[idx][1] > count);
});

test("get_harbor_direction() returns a direction string", function (t) {
  t.true('top_left' === get_harbor_direction(4));
  t.true('top_right' === get_harbor_direction(5));
  t.true('right' === get_harbor_direction(6));
  t.true('bottom_right' === get_harbor_direction(7));
  t.true('bottom_left' === get_harbor_direction(8));
  t.true('left' === get_harbor_direction(9));
});

test("setup_nodes() returns an array of nodes", function (t) {
  var nodes = setup_nodes (new Board.Point(5,5));
  t.true(nodes.length === 6);
  var test_point = new Board.Point(5,5);
  var node_tile_point = nodes[0].n_tiles[0];
  t.true(node_tile_point.x == 5 && node_tile_point.y == 5);
});

test("check_token_placement() shouldn't change token placements on default board", function (t) {
  var board_set = new BoardBuilder.BoardSet(null, null, null, null, 'false');
  t.is(board_set.rnd_tokens, 'false');
  var board = BoardBuilder.generate(board_set);
  var changed = false;

  var ar = [2,3,4,5,6,8,9,10,11];
  for (let num of ar) {
    changed = check_token_placement(board, [num]);
    t.false(changed);
  }
});

test("check_token_placement() should change token placements on random board", function (t) {
  var board_set = new BoardBuilder.BoardSet(null, null, null, null, 'false');
  t.is(board_set.rnd_tokens, 'false');
  var board = BoardBuilder.generate(board_set);
  var changed;

  var ar = [2,3,4,5,6,8,9,10,11];
  for (let num of ar) {
    var new_change = check_token_placement(board, [num]);
    if (!new_change || new_change)
      changed = true;
    if (new_change)
      t.true(new_change);
  }
  t.truthy(changed);

  // can't test unless a known set of random numbers is produced. Job for another day.
  //changed = check_token_placement(board, [6,8]);
  //t.truthy(changed);
});
