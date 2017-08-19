/**
 *  Tests for the Board Builder
 *
 *  The board_builder uses all functions within its .js so
 *  creating a board should test all.
 */

var test = require('ava');

var BoardBuilder = require('../app/game/board_builder.js');

test("Board should be created with non-zero-length props", function(t) {
    var board = BoardBuilder.generate();
    t.true(board.nodes.length > 0);
    t.true(board.roads.length > 0);
    t.true(board.tiles.length > 0);
});

test("Passing a test board to the creator should result in non-zero-length props", function(t) {
    var _board = [
        ["z0",  "z0",  "z0",  "z0",  "z0",  "z0",  "z0"],
        ["z0",  "z0",  "e11", "b12", "d9",  "z0",  "z0"],
        ["z0",  "z0",  "a4",  "c6",  "a5",  "b10", "z0"],
        ["z0",  "f0",  "e3",  "d11", "e4",  "d8",  "z0"],
        ["z0",  "z0",  "a8",  "b10", "b9",  "c3",  "z0"],
        ["z0",  "z0",  "c5",  "d2",  "e6",  "z0",  "z0"],
        ["z0",  "z0",  "z0",  "z0",  "z0",  "z0",  "z0"]
    ];

    var board = BoardBuilder.generate(_board);
    t.true(board.nodes.length > 0);
    t.true(board.roads.length > 0);
    t.true(board.tiles.length > 0);
});

