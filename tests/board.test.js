/**
 *  Tests for the Board
 */
var test = require('ava');

var Game = require('../app/game/game.js');
var Player = require('../app/data_api/player.js');
var board = require('../public/data_api/board.js');
var board_builder = require('../app/game/board_builder.js');

var _board;
var default_board = [
  ["z0", "z0", "z0", "z0", "z0", "z0", "z0"],
  ["z0", "z0", "e11", "b12", "d9", "z0", "z0"],
  ["z0", "z0", "a4", "c6", "a5", "b10", "z0"],
  ["z0", "f0", "e3", "d11", "e4", "d8", "z0"],
  ["z0", "z0", "a8", "b10", "b9", "c3", "z0"],
  ["z0", "z0", "c5", "d2", "e6", "z0", "z0"],
  ["z0", "z0", "z0", "z0", "z0", "z0", "z0"]
];
test.beforeEach(t => {
  _board = board_builder.generate();
});

test("Board object can be created", function (t) {
  var board_obj = new board.Board();
  t.truthy(board_obj);
});

test("Board object can be created from object parsed from JSON", function (t) {
  var jsonData = JSON.stringify(_board);
  var _json_board = new board.Board(JSON.parse(jsonData));
  t.truthy(_json_board);
  var road = _json_board.get_road(0);
  t.truthy(road);
});

test("build_board from passed in map", function (t) {
  var board_set = new board_builder.BoardSet();
  var board = board_builder.generate(board_set);
  t.truthy(board);
});

test("Point creation", function (t) {
  var point = new board.Point(5, 4);
  t.truthy(point);
  t.is(point.x, 5);
  t.is(point.y, 4);
});

test("RoadNode creation", function (t) {
  var road = new board.RoadNode([3, 5]);
  t.truthy(road);
  t.is(road.connects[0], 3);
  t.is(road.connects[1], 5);
});

test("Test board.set_item() for player ID 0", function (t) {
  _board.set_item("build_road", 0, 0);
  var road = _board.get_road(0);
  t.true(road.owner === 0);
  _board.set_item("build_settlement", 0, 0);
  var node = _board.get_node(0);
  t.true(node.owner === 0);
});

test("Test board.clear_item() for player ID 0", function (t) {
  _board.set_item("build_road", 0, 0);
  var road = _board.get_road(0);
  t.true(road.owner === 0);
  _board.clear_item(0, "road");
  t.true(road.owner === -1);

  _board.set_item("build_settlement", 0, 0);
  var node = _board.get_node(0);
  t.true(node.owner === 0);
  _board.clear_item(0, "settlement");
  t.true(node.owner === -1);
});

test("Get a road from the board", function (t) {
  var road = _board.get_road(0);
  t.truthy(road);
});

test("Get a node from the board", function (t) {
  var node = _board.get_node(0);
  t.truthy(node);
});

test("Get a tile from the board", function (t) {
  var point = new board.Point(2, 1);
  var tile = _board.get_tile(point);
  t.truthy(tile);
});

test("Get a tile resource", function (t) {
  var point = new board.Point(2, 1);
  var resource = _board.get_tile_resource_type(point);
  t.truthy(resource);
});

test("Get a nodes connected by road", function (t) {
  var nodes = _board.get_node_indexes_from_road(0);
  t.is(nodes[0], 1);
  t.is(nodes[1], 0);
});

test("Get a roads from node", function (t) {
  var nodes = _board.get_road_indexes_from_node(0);
  t.is(nodes[0], 0);
  t.is(nodes[1], 1);
});

test("Get all tiles with lumber (and count)", function (t) {
  var tiles = _board.get_tiles_with_resource("lumber");
  // console.log(tiles);
  t.is(tiles.length, 4);
});

test("Get players with nodes on resource", function (t) {
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

// TODO: this can sometimes fail if the random board makes a group
test("Get tiles owned by player", function (t) {
  var tiles = _board.get_tiles_with_resource("sheep");
  _board.nodes[tiles[0].associated_nodes[5]].owner = 0;
  _board.nodes[tiles[1].associated_nodes[5]].owner = 0;
  _board.nodes[tiles[2].associated_nodes[5]].owner = 0;
  var tiles = _board.get_resource_owned_by(0, "sheep");
  t.true(tiles.length === 3 || tiles.length === 4);
});

// get_player_ids_on_tile
test("Get player ID's on tile", function (t) {
  let tile = _board.tiles[2][3];
  _board.nodes[tile.associated_nodes[5]].owner = 0;
  let player_ids = _board.get_player_ids_on_tile(tile);
  t.true(player_ids.length === 1 || player_ids[0] === 0);
});

test("Player can build here - blank board", function (t) {
  var can = _board.is_node_valid_build(0, 0);
  t.true(can);
});

test("Player can't build here - node 0 taken", function (t) {
  var node = _board.get_node(0);
  node.owner = 0;
  var can = _board.is_node_valid_build(0, 0);
  t.false(can);
});

test("Player can build road here", function (t) {
  var can = _board.is_road_valid_build(0, 0);
  t.true(can);
});

test("Player can't build road here - node 0 taken", function (t) {
  var node = _board.get_node(0);
  node.owner = 0;
  var can = _board.is_road_valid_build(0, 0);
  t.false(can);
});

test("Player has 1 length road", function (t) {
  var game = new Game();
  game.players[0] = new Player({}, {
    name: 'Tim'
  });
  game.players[0].id = 0;

  game.board.get_road(0)
    .owner = 0;
  var road_map = game.board.longest_roads(game.players);
  t.true(road_map.get(0) == 1);
});

test("Player has 3 length road", function (t) {
  var game = new Game();
  game.players[0] = new Player({}, {
    name: 'Tim'
  });
  game.players[0].id = 0;

  game.board.get_road(0)
    .owner = 0;
  game.board.get_road(1)
    .owner = 0;
  game.board.get_road(2)
    .owner = 0;
  var road_map = game.board.longest_roads(game.players);
  t.true(road_map.get(0) == 3);
});

test("Get a tile corner by number", function (t) {
  var point = new board.Point(2, 1);
  var tile = _board.get_tile(point);
  var corner = tile.get_node_by_corner_num(2);
  t.truthy(corner);
});

test("Get a tile corner by name", function (t) {
  var point = new board.Point(2, 1);
  var tile = _board.get_tile(point);
  var corner = tile.get_node_by_dir("bottom_left")
  t.truthy(corner);
});

test("Get a tile corner functions return the same", function (t) {
  var point = new board.Point(2, 1);
  var tile = _board.get_tile(point);
  var corner1 = tile.get_node_by_corner_num(2)
  var corner2 = tile.get_node_by_dir("bottom_left");
  t.is(corner1, corner2);
});

test("Get shore nodes", function (t) {
  // TODO: function errors
  var nodes = _board.get_shore_node_indexes();
  t.truthy(nodes);
});

test("Get shore road indexs", function (t) {
  var indices = _board.get_shore_road_indexes();
  t.truthy(indices);
});

test("Getting nodes by direction", function (t) {
  /**
   * _board.tiles[3][3] => 3rd row, 3rd hex (including water hex)
   *      associated nodes for this tile are:  [ 31, 32, 29, 20, 19, 22 ]
   */

  t.is(_board.tiles[3][3].get_node_by_dir("bottom_right"), 31);
  t.is(_board.tiles[3][3].get_node_by_dir("bottom_left"), 29);
  t.is(_board.tiles[3][3].get_node_by_dir("top_left"), 20);
  t.is(_board.tiles[3][3].get_node_by_dir("top_mid"), 19);
  t.is(_board.tiles[3][3].get_node_by_dir("top_right"), 22);
  t.is(_board.tiles[3][3].get_node_by_dir("bottom_mid"), 32);
});
