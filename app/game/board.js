/*
    This is based on the original prototype seutp
*/

// TODO: [EASY] Harbours
// TODO: [HARD] Exclude nodes that don't border a resource tile

function Board() {
    this.nodes = [];
    this.roads = [];
    this.tiles = [];
    this.node_tree;
}

/*
*  Takes a 2D array
*
* Numbers in grid determine the tile type
*/
Board.prototype.build_nodes = function(_board) {
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
  // iterate over the input board_array
  for (var y=0; y<_board.length; y++) {
    this.tiles.push([]);
    for (var x=0; x<_board[y].length; x++) {
      // insert tile_node from info
      var tile_info = _board[y][x].match(/([A-Za-z]+)([0-9]+)/);
      var tile_type = this.setup_tile_resource(tile_info[1]);

      var tile = new TileNode(tile_type, (tile_type === "desert"), parseInt(tile_info[2]), []);

      var add_node = true;
      var water = 0;
      // nodes from center of tile are in order;
      // bottom right/middle/left, top left/middle/right. From 30 degrees onwards
      var tile_nodes = this.setup_nodes(new Point(x,y));
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
          for (var n=0; n<this.nodes.length; n++) {
            // check if the node is already indexed, and grab the index if so
            var nodes_in_common = this.compare_point_array(this.nodes[n].n_tiles, tile_nodes[i].n_tiles);
            if (nodes_in_common > 2) {
              add_node = false;
              tile.associated_nodes.push(n); // add association
              break;
            }
          }
        }

        if (add_node) {
          this.nodes.push(tile_nodes[i]);
          tile.associated_nodes.push(this.nodes.length-1);
        }
        add_node = true;
        water = 0;
      }
      this.tiles[y].push(tile);
    }
  }
  // iterate over node_map for each node in the map and find neighbours
  for (var j=0; j<this.nodes.length; j++) {
    this.fill_node_details(this.nodes[j], j);
  }
  // TODO: final iteration of nodes to strip out water only nodes
  //       - issue: water tiles will need node refs removed too
};

/// Count how many Points are the same in each array
Board.prototype.compare_point_array = function(a1, a2) {
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

Board.prototype.array_contains_point = function(point, array) {
    for (var i=0; i<array.length; i++) {
      if (point.x === array[i].x && point.y === array[i].y) {
          return true;
      }
    }
    return false;
};

Board.prototype.setup_tile_resource = function (t) {
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
Board.prototype.setup_nodes = function(coords) {
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

  var bot_right = [new Point(x,y), new Point(x+1,y),     new Point(odd_x,y+1)]; // 0
  var bot_mid   = [new Point(x,y), new Point(odd_x,y+1), new Point(eve_x,y+1)]; // 1
  var bot_left  = [new Point(x,y), new Point(eve_x,y+1), new Point(x-1,y)]; // 2

  var top_left  = [new Point(x,y), new Point(x-1,y),     new Point(eve_x,y-1)]; // 3
  var top_mid   = [new Point(x,y), new Point(eve_x,y-1), new Point(odd_x,y-1)]; // 4
  var top_right = [new Point(x,y), new Point(odd_x,y-1), new Point(x+1,y)]; // 5

  return [new BuildNode(bot_right), new BuildNode(bot_mid), new BuildNode(bot_left),
          new BuildNode(top_left),  new BuildNode(top_mid), new BuildNode(top_right)];
};

/*
*  Takes a node Object and the objects index in the node_map
*
*  The function iterates over the node_map to find neighbouring nodes
*  and adds road nodes between them
*  Note: use only when all nodes have been added to the hashmap
*/
Board.prototype.fill_node_details = function (node, node_index) {
    for (var n=0; n<this.nodes.length; n++) {
      // if n_node.n_tiles contains any combo of two or more of
      // this nodes neighbouring tiles then it is a neighbour node
        if (this.compare_point_array(this.nodes[n].n_tiles, node.n_tiles) >= 2 && n !== node_index) {
            node.n_nodes.push(n);

            // now check for connections between this node and others
            var add_road = true;
            for (var road of this.roads) {
                // if the road exists connecting these node indexes, don't add
                // should be safe in JS since the comparison is between integers
                if (road.connects.indexOf(n) !== -1 &&
                    road.connects.indexOf(node_index) !== -1) {
                    add_road = false;
                    break;
                }
            }
            if (add_road)
                this.roads.push(new RoadNode([n, node_index]));
        }
        if (node.n_nodes.length === 3) {
            break;
        }
    }
};

/********************************************
*  Basic getters for board elements
*********************************************/
/// returns road object
Board.prototype.get_road = function (index) {
  return this.roads[index];
}

/// returns node object
Board.prototype.get_node = function (index) {
  return this.nodes[index];
}

/// returns tile object
Board.prototype.get_tile = function (point) {
  return this.tiles[point.y][point.x];
};

/// returns resource type string
Board.prototype.get_tile_resource_type = function (point) {
  return this.tiles[point.y][point.x].type;
};

/********************************************
*  More advanced getters for board elements
*********************************************/
/// returns the index numbers for nodes
Board.prototype.get_node_indexes_from_road = function (index) {
  return [this.nodes[this.roads[index].connects[0]],
          this.nodes[this.roads[index].connects[1]]];
}

/// returns an array of tile objects
Board.prototype.get_tiles_with_resource = function (resource) {
  var array = [];
  for (var y=0; y< this.tiles.length; y++) {
    for (var x=0; x< this.tiles.length; x++) {
      var tile = this.tiles[y][x];
      if (tile.type === resource)
        array.push(tile);
    }
  }
  return array;
};

/// returns an array of player names
Board.prototype.get_players_with_resource = function (resource) {
  var players = [];
  var tiles = this.get_tiles_of_resource(resource);
  for (var t=0; t<this.tiles.length; t++) {
    if (this.tiles[t].owner)
      players.push(this.tiles[t].owner);
  }
  return players;
};

/// returns an array of indexes for Board.nodes
Board.prototype.get_shore_node_indexes = function() {
  var nodes = [];
  for (var n=0; n<this.nodes.length; n++) {
    var count = 0;
    for (var t=0; t<this.nodes[n].tiles.length; t++) {
      var tile = this.nodes[n].tiles[t];
      if (tile.type === 'water') {
        count +=1;
      }
    }
    if ((count === 1 || count === 2) && count !== 3) {
      nodes.push(n);
    }
  }
  return nodes;
}

/// returns an array of indexes for Board.nodes
Board.prototype.get_shore_road_indexes = function() {
  var roads = [];
  var nodes = this.get_shore_node_indexes();
  for (var r=0; r<this.roads.length; r++) {
    if (nodes.indexOf(this.roads[r].connects[0]) && nodes.indexOf(this.roads[r].connects[0]))
    roads.push(r);
  }
  return roads;
}

// TODO: should build a binary tree at some point for this.
// Board.prototype.is_path_to_owned_by(start_node, end_node, owner)

/********************************************
*  Misc
*********************************************/

/*
*  A Points object for storing coordinates - forces integer
*/
function Point(x,y) {
    this.x = parseInt(x);
    this.y = parseInt(y);
};

function RoadNode(connects) {
    this.connects = connects; // nodes that are neighbours of this node
    this.owner = "";
};

function BuildNode(n_tiles) {
    this.n_tiles = n_tiles; // tiles this node intersects
    this.n_nodes = []; // nodes that are neighbours of this node
    this.building = "";//
    this.owner = "";
};

function TileNode(type, robber, token, asso) {
    this.type = type;
    this.robber = robber;
    this.token = token;
    this.associated_nodes = asso;
};

TileNode.prototype.get_node_by_corner_num = function(corner_number) {
  return this.associated_nodes[corner_number];
};

TileNode.prototype.get_node_by_dir = function(direction) {
  if (direction === "bottom_right") {
    return this.associated_nodes[0];
  } else if (direction === "bottom_mid") {
    return this.associated_nodes[1];
  } else if (direction === "bottom_left") {
    return this.associated_nodes[2];
  } else if (direction === "top_left") {
    return this.associated_nodes[3];
  } else if (direction === "top_mid") {
    return this.associated_nodes[4];
  } else if (direction === "top_right") {
    return this.associated_nodes[5];
  }
};

// function is_connected_to?

/*
*  Takes the center point of tile, the tile height, and corner number to find (0..5)
* Corner #0 is top-right corner, rotating through clockwise
*
*  Returns a pixel coordinate which is the corner, and center of node hotspot

function hex_corner(center, tile_height, i) {
  var angle_deg = 60 * i   + 30;
  var angle_rad = PI / 180 * angle_deg;
  return Point(center.x + tile_height * cos(angle_rad), center.y + tile_height * sin(angle_rad));
};
*/
module.exports = { Board, Point, TileNode, RoadNode, BuildNode };
