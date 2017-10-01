// TODO: replate is with import as we have names exports on board js
// ie. import { Board, Point, TileNode, RoadNode, BuildNode } from '../../public/data_api/board.js';
// then we can avoud the statements like Board.Board()
var Board = require('../../public/data_api/board.js');
var Shuffler = require('../helpers/shuffler.js');
var logger = require('winston');

log = function(level, inf) {
  if (typeof inf === "object" && level === "debug") {
    logger.log(level, 'BOARD BUILDER: object data =');
    console.log(inf);
  } else {
    logger.log(level, 'BOARD_BUILDER: ', inf);
  }
}

function BoardSet(pattern, tile_stack, tokens, harbor_stack, rndTokens) {
  // even # row is moved over by tile_width/2
  // 0 = water
  // 1 = standard tile
  // harbors, 4 = top_left,     5 = top_right,   6 = right
  //           7 = bottom_right, 8 = bottom_left, 9 = left
  // All of standard_ are associated.
  this.pattern = pattern;
  if (!this.pattern)
    this.pattern = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 4, 5, 1, 0, 0],
      [0, 0, 9, 1, 1, 5, 0],
      [0, 1, 1, 1, 1, 6, 0],
      [0, 0, 9, 1, 1, 7, 0],
      [0, 0, 8, 7, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]
    ];
  this.tile_stack = tile_stack;
  if (!this.tile_stack)
    this.tile_stack = [
      ['brick', 3],
      ['sheep', 4],
      ['ore',   3],
      ['grain', 4],
      ['lumber',4],
      ['desert',1]
    ];
  this.tokens = tokens;
  if (!this.tokens)
    this.tokens = [9,10,8,12,5,4,3,11,6,11,6,4,3,9,2,8,10,5];
  this.harbor_stack = harbor_stack;
  if (!this.harbor_stack)
    this.harbor_stack = [
      ['three', 4],
      ['brick', 1],
      ['sheep', 1],
      ['ore',   1],
      ['grain', 1],
      ['lumber',1]
    ];
  this.rnd_tokens = rndTokens;
};

/*
 * Takes a 2D array
 *
 * Numbers in grid determine the tile type
 */
generate = function (board_set = new BoardSet()) {
  var shuff = new Shuffler();
  var board = new Board.Board();
  board.rnd_tokens = (typeof board.rnd_tokens === 'undefined') ? process.env['rndTokens'] : 'false';
  log('debug', '.rnd_tokens = '+board.rnd_tokens);
  // iterate over the input board_array
  for (var y = 0; y < board_set.pattern.length; y++) {
    board.tiles.push([]);
    for (var x = 0; x < board_set.pattern[y].length; x++) {
      /***************************
      This block sets up the tile
      ****************************/
      // select a resource randomly
      log('debug', 'choosing random resource');
      var tile_type = (board_set.pattern[y][x] !== 0) ? random_from_stack(board_set.tile_stack) : "water";
      if (tile_type !=="" && tile_type !== "water")
        log('debug', 'resource = '+tile_type);
      if (tile_type === "")
        log('error', 'FAILED: random resource');

      var token = "";
      if (tile_type !=="" && tile_type !== "water" && tile_type !== "desert") {
        if (board_set.rnd_tokens === "true") {
          log('debug', 'doing random token placement');
          if (board.tiles.length > 0 && board.tiles[y].length > 0) {
            board_set.tokens = shuff.shuffle(board_set.tokens);
            token = board_set.tokens.pop();
          }
        } else {
          token = board_set.tokens.pop();
        }
      }
      // type, robber?, token token, associated nodes
      var tile = new Board.TileNode(tile_type, (tile_type === "desert"), token, []);

      // choose harbor type if tile is a harbor
      if (board_set.pattern[y][x] >= 4 && board_set.pattern[y][x] <= 9) {
        log('debug', 'choosing random harbor');
        tile.harbor = random_from_stack(board_set.harbor_stack);
        tile.harbor_direction = get_harbor_direction(board_set.pattern[y][x]);
        log('debug', 'harbor direction is '+tile.harbor_direction);
        if (tile.harbor === "" || !tile.harbor)
          log('error', 'FAILED: random harbor');
      }
      // Store reference to robber location
      // TODO check this - storing a dupe of the tile
      if (tile_type === 'desert')
        board.robberLocation = tile;
      /****** block end *******/

      add_tile_nodes(board, board_set.pattern, tile, new Board.Point(x, y));

      // add harbor property to associated tile nodes
      if (tile.harbor_direction !== "")
        set_node_harbor(board, tile);

      board.tiles[y].push(tile);

      // Create an array of the the resource tiles
      if (['desert', 'water'].indexOf(tile_type) === -1) {
        board.resourceTiles.push(tile);
      }
    } // for loop end
  } // board input for loop ends

  if (board_set.rnd_tokens  === "true") {
    log('debug', 'doing first token check');
    var ar = [2,3,4,5,6,8,9,10,11];
    for (let num of ar) {
      check_token_placement(board, [num]);
    }
    check_token_placement(board, [6,8]);
  }
  // iterate over node_map for each node in the map and find neighbours
  for (var j = 0; j < board.nodes.length; j++) {
    fill_node_details(board, board.nodes[j], j);
  }
  return board;
};

/// Count how many Points are the same in each array
compare_point_array = function (a1, a2) {
  var count = 0;
  for (var i = 0; i < a1.length; i++) {
    for (var j = 0; j < a2.length; j++) {
      if (a1[i].x === a2[j].x && a1[i].y === a2[j].y) {
        count += 1;
      }
    }
  }
  return count;
};

getRandomIntInclusive = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
};

random_from_stack = function (stack) {
  var checked = [];
  var idx = -1;
  do {
    idx = getRandomIntInclusive(0, stack.length-1);
    log('debug', 'random number = '+idx);
    if (checked.indexOf(idx) === -1 && stack[idx][1] > 0) {
      stack[idx][1] -= 1;
      log('debug', 'random_from_stack chose '+stack[idx][0]);
      log('debug', 'remaining = '+stack[idx][1]);
      return stack[idx][0];
    }
    if (checked.indexOf(idx) !== -1)
      checked.push(idx);
  } while (checked.length < stack.length);
  log('debug', 'Reached end of stack in random_from_stack()');
  return "";
};

get_harbor_direction = function(num) {
  switch (num) {
    case 4:
      return 'top_left';
    case 5:
      return 'top_right';
    case 6:
      return 'right';
    case 7:
      return 'bottom_right';
    case 8:
      return 'bottom_left';
    case 9:
      return 'left';
  }
  log('error', 'failed to match harbor direction');
  return false;
};

set_node_harbor = function(board, tile) {
  switch (tile.harbor_direction) {
    case 'top_left':
      board.nodes[tile.get_node_by_dir("top_left")].harbor = tile.harbor;
      board.nodes[tile.get_node_by_dir("top_mid")].harbor = tile.harbor;
      break;
    case 'top_right':
      board.nodes[tile.get_node_by_dir("top_mid")].harbor = tile.harbor;
      board.nodes[tile.get_node_by_dir("top_right")].harbor = tile.harbor;
      break;
    case 'right':
      board.nodes[tile.get_node_by_dir("top_right")].harbor = tile.harbor;
      board.nodes[tile.get_node_by_dir("bottom_right")].harbor = tile.harbor;
      break;
    case 'bottom_right':
      board.nodes[tile.get_node_by_dir("bottom_right")].harbor = tile.harbor;
      board.nodes[tile.get_node_by_dir("bottom_mid")].harbor = tile.harbor;
      break;
    case 'bottom_left':
      board.nodes[tile.get_node_by_dir("bottom_mid")].harbor = tile.harbor;
      board.nodes[tile.get_node_by_dir("bottom_left")].harbor = tile.harbor;
      break;
    case 'left':
      board.nodes[tile.get_node_by_dir("bottom_left")].harbor = tile.harbor;
      board.nodes[tile.get_node_by_dir("top_left")].harbor = tile.harbor;
      break;
  }
};

check_token_placement = function(board, not_allowed) {
  // assumes that the outside tiles are always water
  var changed = false;
  for (var y = 0; y < board.tiles.length; y++) {
    for (var x = 0; x < board.tiles[y].length; x++) {
      if (board.tiles[y][x].type !== "water" && board.tiles[y][x].type !== "desert") {
        var odd_x = x;
        var eve_x = x;

        if (y % 2 !== 0) {
          odd_x = x + 1;
          eve_x = x;
        } else {
          odd_x = x;
          eve_x = x - 1;
        }
        if ((not_allowed.indexOf(board.tiles[y-1][eve_x].token) !== -1 ||
            not_allowed.indexOf(board.tiles[y-1][odd_x].token) !== -1 ||
            not_allowed.indexOf(board.tiles[y][x+1].token) !== -1 ||
            not_allowed.indexOf(board.tiles[y][x-1].token) !== -1 ||
            not_allowed.indexOf(board.tiles[y+1][odd_x].token) !== -1 ||
            not_allowed.indexOf(board.tiles[y+1][eve_x].token) !== -1) &&
            not_allowed.indexOf(board.tiles[y][x].token) !== -1) {
          log('debug', 'found swappable token = '+board.tiles[y][x].token);
          board.tiles[y][x].token = swap_not_allowed_token(board, board.tiles[y][x].token, not_allowed);
          log('debug', 'swapped token = '+board.tiles[y][x].token);
          changed = true;
        }
      }
    }
  }
  return changed; // mostly for testing
};

swap_not_allowed_token = function(board, token, not_allowed) {
  // assumes that the outside tiles are always water
  for (var y = 0; y < board.tiles.length; y++) {
    for (var x = 0; x < board.tiles[y].length; x++) {
      if (board.tiles[y][x].type !== "water" && board.tiles[y][x].type !== "desert") {
        if (not_allowed.indexOf(board.tiles[y][x].token) === -1) {
          var old = board.tiles[y][x].token;
          board.tiles[y][x].token = token;
          return old;
        }
      }
    }
  }
};

add_tile_nodes = function(board, pattern, tile, tile_point) {
  var add_node = true;
  var water = 0;
  // nodes from center of tile are in order;
  // bottom right/middle/left, top left/middle/right. From 30 degrees onwards
  var tile_nodes = setup_nodes(tile_point);
  for (var i = 0; i < tile_nodes.length; i++) {
    // Check if node has neighbours out of pattern bounds, or completely surrounded by water
    for (var w = 0; w < tile_nodes[i].n_tiles.length; w++) {
      // if x,y is out of array bounds we can't index the pattern with it to check type
      if ((tile_nodes[i].n_tiles[w].x >= 0 && tile_nodes[i].n_tiles[w].x < pattern[0].length) &&
        (tile_nodes[i].n_tiles[w].y >= 0 && tile_nodes[i].n_tiles[w].y < pattern.length)) {

        var check_tile = pattern[tile_nodes[i].n_tiles[w].y][tile_nodes[i].n_tiles[w].x];
        if (check_tile === 0) {
          water += 1;
        }
      } else {
        water += 1;
      }
    }
    // intersecting more than two water tiles means it isn't on a resource tile, don't add
    if (water > 2) {
      add_node = false;
      break;
    } else {
      for (var n = 0; n < board.nodes.length; n++) {
        // check if the node is already indexed, and grab the index if so
        var nodes_in_common = compare_point_array(board.nodes[n].n_tiles, tile_nodes[i].n_tiles);
        if (nodes_in_common > 2) {
          add_node = false;
          tile.associated_nodes.push(n); // add association
          break;
        }
      }
    }

    if (add_node) {
      board.nodes.push(tile_nodes[i]);
      board.nodes[board.nodes.length - 1].id = board.nodes.length - 1;
      tile.associated_nodes.push(board.nodes.length - 1);
    }
    add_node = true;
    water = 0;
  } // tile_nodes for loop ends
};

/*
 *  Takes a tuple (x,y) representing the tile coords
 *
 *  Pushes new nodes and their hash in to hashmap
 */
setup_nodes = function (coords) {
  var x = coords.x;
  var y = coords.y;
  var odd_x = x;
  var eve_x = x;

  if (coords.y % 2 !== 0) {
    odd_x = x + 1;
    eve_x = x;
  } else {
    odd_x = x;
    eve_x = x - 1;
  }

  var bot_right = [new Board.Point(x, y), new Board.Point(x + 1, y), new Board.Point(odd_x, y + 1)]; // 0
  var bot_mid = [new Board.Point(x, y), new Board.Point(odd_x, y + 1), new Board.Point(eve_x, y + 1)]; // 1
  var bot_left = [new Board.Point(x, y), new Board.Point(eve_x, y + 1), new Board.Point(x - 1, y)]; // 2

  var top_left = [new Board.Point(x, y), new Board.Point(x - 1, y), new Board.Point(eve_x, y - 1)]; // 3
  var top_mid = [new Board.Point(x, y), new Board.Point(eve_x, y - 1), new Board.Point(odd_x, y - 1)]; // 4
  var top_right = [new Board.Point(x, y), new Board.Point(odd_x, y - 1), new Board.Point(x + 1, y)]; // 5

  return [new Board.BuildNode(bot_right), new Board.BuildNode(bot_mid), new Board.BuildNode(bot_left),
    new Board.BuildNode(top_left), new Board.BuildNode(top_mid), new Board.BuildNode(top_right)
  ];
};

/*
 *  Takes a node Object and the objects index in the node_map
 *
 *  The function iterates over the node_map to find neighbouring nodes
 *  and adds road nodes between them
 *  Note: use only when all nodes have been added to the hashmap
 */
fill_node_details = function (board, node, node_index) {
  for (var n = 0; n < board.nodes.length; n++) {
    // if n_node.n_tiles contains any combo of two or more of
    // this nodes neighbouring tiles then it is a neighbour node
    if (compare_point_array(board.nodes[n].n_tiles, node.n_tiles) >= 2 && n !== node_index) {
      var add_road = true;
      // check if there are two water tiles in common, if there are
      // then there is a body of water between the two nodes
      var shared_water_count = 0;
      for (var w=0; w<board.nodes[n].n_tiles.length; w++) {
        var other_point = board.nodes[n].n_tiles[w];
        var other_tile = board.get_tile(other_point);
        if (other_tile !== -1 && other_tile.type === "water") {
          for (var f=0; f<node.n_tiles.length; f++) {
            if (node.n_tiles[f].x === other_point.x &&
                node.n_tiles[f].y === other_point.y) {
              shared_water_count += 1;
            }
          }
        }
      }
      node.n_nodes.push(n);

      // now check for connections between this node and others
      if (shared_water_count <= 1) {
        for (var r = 0; r < board.roads.length; r++) {
          var road = board.roads[r];
          // if the road exists connecting these node indexes, don't add
          // should be safe in JS since the comparison is between integers
          if (road.connects.indexOf(n) !== -1 &&
            road.connects.indexOf(node_index) !== -1) {
            node.n_roads.push(r);
            add_road = false;
            break;
          }
        }

        if (add_road) {
          board.roads.push(new Board.RoadNode([n, node_index]));
          board.roads[board.roads.length - 1].id = board.roads.length - 1;
          node.n_roads.push(board.roads.length - 1);
        }
      }
    }
    // early exit if possible
    if (node.n_nodes.length === 3) {
      break;
    }
  }
};

module.exports = {
  generate, BoardSet
};
