// TODO: replate is with import as we have names exports on board js
// ie. import { Board, Point, TileNode, RoadNode, BuildNode } from '../../public/data_api/board.js';
// then we can avoud the statements like Board.Board()
var Board    = require('../../public/data_api/board.js');
// TODO: [EASY] Harbours

/*
* Takes a 2D array
*
* Numbers in grid determine the tile type
*/
generate = function(_board) {
  if (!_board) {
    // Standard layout (as seen in the manual)
    // even # row is moved over by tile_width/2
    _board = [
        ["z0",  "z0",  "z0",  "z0",  "z0",  "z0",  "z0"],
        ["z0",  "z0",  "e11", "b12", "d9",  "z0",  "z0"],
        ["z0",  "z0",  "a4",  "c6",  "a5",  "b10", "z0"],
        ["z0",  "f0",  "e3",  "d11", "e4",  "d8",  "z0"],
        ["z0",  "z0",  "a8",  "b10", "b9",  "c3",  "z0"],
        ["z0",  "z0",  "c5",  "d2",  "e6",  "z0",  "z0"],
        ["z0",  "z0",  "z0",  "z0",  "z0",  "z0",  "z0"]
    ];
  }
  var board = new Board.Board();
  // iterate over the input board_array
  for (var y=0; y<_board.length; y++) {
    board.tiles.push([]);
    for (var x=0; x<_board[y].length; x++) {
      // insert tile_node from info
      var tile_info = _board[y][x].match(/([A-Za-z]+)([0-9]+)/);
      var tile_type = setup_tile_resource(tile_info[1]);

      var tile = new Board.TileNode(tile_type, (tile_type === "desert"), parseInt(tile_info[2]), []);

      // Store reference to robber location
      if (tile_type === 'desert') {
        board.robberLocation = tile;
      }

      // Create an array of the the resource tiles
      if (['desert', 'water'].indexOf(tile_type) === -1) {
        board.resourceTiles.push(tile);
      }

      var add_node = true;
      var water = 0;
      // nodes from center of tile are in order;
      // bottom right/middle/left, top left/middle/right. From 30 degrees onwards
      var tile_nodes = setup_nodes(new Board.Point(x,y));
      for (var i=0; i<tile_nodes.length; i++) {
        // Check if node has neighbours out of _board bounds, or completely surrounded by water
        for (var w=0; w<tile_nodes[i].n_tiles.length; w++) {
          // if x,y is out of array bounds we can't index the _board with it to check type
          if ((tile_nodes[i].n_tiles[w].x >= 0 && tile_nodes[i].n_tiles[w].x < _board[0].length) &&
              (tile_nodes[i].n_tiles[w].y >= 0 && tile_nodes[i].n_tiles[w].y < _board.length)) {
            if (_board[tile_nodes[i].n_tiles[w].y][tile_nodes[i].n_tiles[w].x] == "z0") {
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
          for (var n=0; n<board.nodes.length; n++) {
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
          board.nodes[board.nodes.length-1].id = board.nodes.length-1;
          tile.associated_nodes.push(board.nodes.length-1);
        }
        add_node = true;
        water = 0;
      }
      board.tiles[y].push(tile);
    }
  }
  // iterate over node_map for each node in the map and find neighbours
  for (var j=0; j<board.nodes.length; j++) {
    fill_node_details(board, board.nodes[j], j);
  }

  // console.log(board);

  return board;
};

/// Count how many Points are the same in each array
compare_point_array = function(a1, a2) {
    var count = 0;
    for (var i=0; i<a1.length; i++) {
        for (var j=0; j<a2.length; j++) {
            if (a1[i].x === a2[j].x && a1[i].y === a2[j].y) {
                count += 1;
            }
        }
    }
    return count;
};

setup_tile_resource = function (t) {
    if (t === 'a') {
        return "brick";
    } else if (t === 'b') {
        return "sheep";
    } else if (t === 'c') {
        return "ore";
    } else if (t === 'd') {
        return "grain";
    } else if (t === 'e') {
        return "lumber";
    } else if (t === 'f') {
        return "desert";
    } else if (t === 'z') {
        return "water";
    }
};

/*
*  Takes a tuple (x,y) representing the tile coords
*
*  Pushes new nodes and their hash in to hashmap
*/
setup_nodes = function(coords) {
  var x = coords.x;
  var y = coords.y;
  var odd_x = x;
  var eve_x = x;

  if (coords.y % 2 !== 0) {
      odd_x = x+1;
      eve_x = x;
  } else {
      odd_x = x;
      eve_x = x-1;
  }

  var bot_right = [new Board.Point(x,y), new Board.Point(x+1,y),     new Board.Point(odd_x,y+1)]; // 0
  var bot_mid   = [new Board.Point(x,y), new Board.Point(odd_x,y+1), new Board.Point(eve_x,y+1)]; // 1
  var bot_left  = [new Board.Point(x,y), new Board.Point(eve_x,y+1), new Board.Point(x-1,y)]; // 2

  var top_left  = [new Board.Point(x,y), new Board.Point(x-1,y),     new Board.Point(eve_x,y-1)]; // 3
  var top_mid   = [new Board.Point(x,y), new Board.Point(eve_x,y-1), new Board.Point(odd_x,y-1)]; // 4
  var top_right = [new Board.Point(x,y), new Board.Point(odd_x,y-1), new Board.Point(x+1,y)]; // 5

  return [new Board.BuildNode(bot_right), new Board.BuildNode(bot_mid), new Board.BuildNode(bot_left),
          new Board.BuildNode(top_left),  new Board.BuildNode(top_mid), new Board.BuildNode(top_right)];
};

/*
*  Takes a node Object and the objects index in the node_map
*
*  The function iterates over the node_map to find neighbouring nodes
*  and adds road nodes between them
*  Note: use only when all nodes have been added to the hashmap
*/
fill_node_details = function (board, node, node_index) {
    for (var n=0; n<board.nodes.length; n++) {
      // if n_node.n_tiles contains any combo of two or more of
      // this nodes neighbouring tiles then it is a neighbour node
        if (compare_point_array(board.nodes[n].n_tiles, node.n_tiles) >= 2 && n !== node_index) {
            node.n_nodes.push(n);

            // now check for connections between this node and others
            var add_road = true;
            for (var r=0; r<board.roads.length; r++) {
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
                board.roads[board.roads.length-1].id = board.roads.length-1;
                node.n_roads.push(board.roads.length-1);
            }
        }
        if (node.n_nodes.length === 3) {
            break;
        }
    }
};

module.exports = { generate };
