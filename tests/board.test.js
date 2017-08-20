/**
 *  Tests for the Board
 */
var test = require('ava');

var board = require('../public/data_api/board.js');
var board_builder = require('../app/game/board_builder.js');

var _board;
var default_board = [
        ["z0",  "z0",  "z0",  "z0",  "z0",  "z0",  "z0"],
        ["z0",  "z0",  "e11", "b12", "d9",  "z0",  "z0"],
        ["z0",  "z0",  "a4",  "c6",  "a5",  "b10", "z0"],
        ["z0",  "f0",  "e3",  "d11", "e4",  "d8",  "z0"],
        ["z0",  "z0",  "a8",  "b10", "b9",  "c3",  "z0"],
        ["z0",  "z0",  "c5",  "d2",  "e6",  "z0",  "z0"],
        ["z0",  "z0",  "z0",  "z0",  "z0",  "z0",  "z0"]
    ];
test.beforeEach(t => {
    _board = board_builder.generate();
});

test("Board object can be created", function(t) {
    var board_obj = new board.Board();
    t.truthy(board_obj);
});

test("Board object can be created from object parsed from JSON", function(t) {
    var jsonData = JSON.stringify(_board);
    var _json_board = new board.Board(JSON.parse(jsonData));
    t.truthy(_json_board);
    var road = _json_board.get_road(0);
    t.truthy(road);
});

test("build_board from passed in map", function(t) {
    var board_obj = board_builder.generate(default_board);
    t.truthy(board_obj);
});

test("Point creation", function(t) {
    var point = new board.Point(5,4);
    t.truthy(point);
    t.is(point.x, 5);
    t.is(point.y, 4);
});

test("RoadNode creation", function(t) {
    var road = new board.RoadNode([3,5]);
    t.truthy(road);
    t.is(road.connects[0], 3);
    t.is(road.connects[1], 5);
});

test("Get a road from the board", function(t) {
    var road = _board.get_road(0);
    // console.log(road);
    t.truthy(road);
});

test("Get a node from the board", function(t) {
    var node = _board.get_node(0);
    // console.log(node);
    t.truthy(node);
});

test("Get a tile from the board", function(t) {
    var point = new board.Point(2,1);
    var tile = _board.get_tile(point);
    t.truthy(tile);
});

test("Get a tile resource", function(t) {
    var point = new board.Point(2,1);
    var resource = _board.get_tile_resource_type(point);
    t.is(resource, "lumber");
});

test("Get a nodes connected by road", function(t) {
    var nodes = _board.get_node_indexes_from_road(0);
    t.is(nodes[0], 1);
    t.is(nodes[1], 0);
});

test("Get a roads from node", function(t) {
    var nodes = _board.get_road_indexes_from_node(0);
    t.is(nodes[0], 0);
    t.is(nodes[1], 1);
});

test("Get all tiles with lumber (and count)", function(t) {
    var tiles = _board.get_tiles_with_resource("lumber");
    // console.log(tiles);
    t.is(tiles.length, 4);
});

test("Get players with nodes on resource", function(t) {
    var tiles = _board.get_tiles_with_resource("lumber");
    _board.nodes[tiles[0].associated_nodes[0]].owner = 0;
    _board.nodes[tiles[1].associated_nodes[1]].owner = 0;
    _board.nodes[tiles[2].associated_nodes[3]].owner = 1;
    _board.nodes[tiles[3].associated_nodes[3]].owner = 1;
    var player = _board.get_players_with_resource("lumber");
    t.is(player[0], 0);
    t.is(player[1], 1);
    t.is(player.length, 2);
});

test("Player can build here - blank board", function(t) {
    var can = _board.is_node_valid_build(0, 0);
    t.true(can);
});

test("Player can't build here - node 1 taken", function(t) {
    var node = _board.get_node(1);
    node.owner = 1;
    var can = _board.is_node_valid_build(0, 0);
    t.false(can);
});

test("Player can build road here", function(t) {
    var can = _board.is_road_valid_build(0, 0);
    t.true(can);
});

test("Player can't build road here - node 1 taken", function(t) {
    var node = _board.get_node(1);
    node.owner = 1;
    var can = _board.is_road_valid_build(0, 0);
    t.false(can);
});

test("Get a tile corner by number", function(t) {
    var point = new board.Point(2,1);
    var tile = _board.get_tile(point);
    var corner = tile.get_node_by_corner_num(2);
    t.truthy(corner);
});

test("Get a tile corner by name", function(t) {
    var point = new board.Point(2,1);
    var tile = _board.get_tile(point);
    var corner = tile.get_node_by_dir("bottom_left")
    t.truthy(corner);
});

test("Get a tile corner functions return the same", function(t) {
    var point = new board.Point(2,1);
    var tile = _board.get_tile(point);
    var corner1 = tile.get_node_by_corner_num(2)
    var corner2 = tile.get_node_by_dir("bottom_left");
    t.is(corner1, corner2);
});

