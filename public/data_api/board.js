function Board(obj) {
  this.nodes = [];
  this.roads = [];
  this.tiles = [];
  this.harbours = [];
  // Array of resource locations
  this.resourceTiles = [];

  // Where the robber lives
  this.robberLocation = null;

  // This if statement must come last to ensure all data is filled in correctly
  if (obj) {
    for (var prop in obj) this[prop] = obj[prop];
  }
}
/********************************************
*  Basic setters for board elements
*********************************************/
/**
* Modifies the owner of road or settlement array
* (used in setup) - modify for general use
* @param {String} item
* @param {integer} index
* @param {integer} player_id
*/
Board.prototype.set_item = function(item, index, player_id) {
   if (item === 'build_road') {
    this.roads[index].owner = player_id;
    this.roads[index].status = '';
   } else if(item === 'build_settlement') {
    this.nodes[index].building = 'settlement';
    this.nodes[index].owner = player_id;
    this.nodes[index].status = '';
  } else if (item === "build_city") {
    this.nodes[index].building = 'city';
    this.nodes[index].status = '';
  }
};

Board.prototype.clear_item = function(index, object_type) {
  if (object_type === 'road') {
   this.roads[index].owner = -1;
   this.roads[index].status = "";
  } else if (object_type === 'settlement') {
    this.nodes[index].building = "";
    this.nodes[index].owner = -1;
    this.nodes[index].status = "";
  } else if (object_type === 'city') {
    this.nodes[index].building = "settlement";
    this.nodes[index].status = "";
   }
};

/********************************************
*  Basic getters for board elements
*********************************************/
/**
* Returns road object from the given index to Board.roads
* @param {Integer} index
* @return {RoadNode} Board.roads[index]
*/
Board.prototype.get_road = function (index) {
  return this.roads[index];
}

/**
* Returns building node object from the given index to Board.nodes
* @param {Integer} index
* @return {BuildNode} Board.nodes[index]
*/
Board.prototype.get_node = function (index) {
  return this.nodes[index];
}

/**
* Returns tile object located at grid point
* @param {Point} point
* @return {Tile} Tile - the tile object
*/
Board.prototype.get_tile = function (point) {
  return this.tiles[point.y][point.x];
};

/**
* Returns string describing the resource type
* @param {Point} point
* @return {String} resource type name
*/
Board.prototype.get_tile_resource_type = function (point) {
  return this.tiles[point.y][point.x].type;
};

/********************************************
*  More advanced getters for board elements
*********************************************/
/**
* Returns an array of the index numbers for nodes
* @param {Integer} index
* @return {Object[]} integer - the index number of the node in Board.nodes
*/
Board.prototype.get_node_indexes_from_road = function (index) {
  return [this.roads[index].connects[0],
          this.roads[index].connects[1]];
}

/**
* Returns an array of the index numbers for roads
* @param {Integer} index
* @return {Object[]} integer - the index number of the road in Board.roads
*/
Board.prototype.get_road_indexes_from_node = function (index) {
  var array = [];
  for (var i=0; i<this.nodes[index].n_roads.length; i++) {
      array.push(this.nodes[index].n_roads[i]);
  }
  return array;
};

/**
* Returns an array of tile objects
* @param {String} resource
* @return {Object[]} Tile - the tile object
*/
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

/**
* Returns an array of player names
* @param {String} resource
* @return {Object[]} String - player names
*/
Board.prototype.get_players_with_resource = function (resource) {
  var players = [];
  var tiles = this.get_tiles_with_resource(resource);
  for (var t=0; t<tiles.length; t++) {
    for (var n=0; n<tiles[t].associated_nodes.length; n++) {
        var index = tiles[t].associated_nodes[n];
        var owner = this.nodes[index].owner;
        if (owner !== -1 && players.indexOf(owner) == -1)
            players.push(this.nodes[index].owner);
        }
  }
  return players;
};

/**
* Returns an array of indexes for Board.nodes that are on the shoreline
* @return {Object[]} Integer - the index numbers for nodes in this.nodes
*/
Board.prototype.get_shore_node_indexes = function() {
  var ret_nodes = [];
  for (var n=0; n<this.nodes.length; n++) {
    var count = 0;
    for (var t=0; t<this.nodes[n].n_tiles.length; t++) {
      var point = this.nodes[n].n_tiles[t];
      if (this.get_tile_resource_type(point) === "water")
        count +=1;
    }
    if ((count === 1 || count === 2) && count !== 3)
      ret_nodes.push(n);
  }
  return ret_nodes;
}

/**
* Returns an array of indexes for Board.roads that are on the shoreline
* @return {Object[]} Integer - the index numbers for roads in this.roads
*/
Board.prototype.get_shore_road_indexes = function() {
  var roads = [];
  var nodes = this.get_shore_node_indexes();

  for (var n=0; n<nodes.length; n++) {
    var node = this.nodes[nodes[n]];
    for (var r=0; r<node.n_roads.length; r++) {
      var road = this.roads[node.n_roads[r]];
      if (nodes.indexOf(road.connects[0]) !== -1 &&
          nodes.indexOf(road.connects[1]) !== -1 &&
          roads.indexOf(road.id) === -1)
        roads.push(road.id);
    }
  }
  return roads;
}

/**
* Returns bool from node index where a player wants to build.
* @param {Integer} player
* @param {Integer} index
* @return {Bool} - True if player can build here
*/
// TODO: recursive memoization would be best here
// TODO: check roads
Board.prototype.is_node_valid_build = function(player, index) {
  var node = this.nodes[index];
  if (node.owner !== -1)
      return false;
  var count = 0;

  for (var n1=0; n1<node.n_nodes.length; n1++) {
      var neighbour = this.nodes[node.n_nodes[n1]];
      if (neighbour.owner !== -1)
          count += 1;
  }
  return (count === 0);
}

// TODO:
/**
* Returns bool if a node owned by the player has a road path to another node
* player wants to build.
* @param {Integer} player
* @param {Integer} index
*/
Board.prototype.has_node_player_road_to = function(player, index) {
// TODO: stop using forEach on integers, numbnuts
//    return (this.nodes[index].n_roads.forEach(function(road) {
//        return (road.owner === player);
//        }));
}

/**
* Returns bool if the road can be built by player
* @param {Integer} player
* @param {Integer} index
* @return {Bool} - true if the road can be built by player
*/
Board.prototype.is_road_valid_build = function(player, index) {
  var road = this.roads[index];
  if (road.owner !== -1)
      return false;
  if ((this.nodes[road.connects[0]].owner !== player && this.nodes[road.connects[1]].owner !== -1) ||
      (this.nodes[road.connects[1]].owner !== player && this.nodes[road.connects[0]].owner !== -1) ||
      (this.nodes[road.connects[1]].owner !== -1 && this.nodes[road.connects[0]].owner !== -1))
      return false;
  return true;
}

/**
* Returns length of longest road for player
* @param  {Integer}   player_id
* @return {Integer} - length of the longest road this player owns
*/
// TODO: Inefficient, ends up doing longest roads twice, from start and end
Board.prototype.longest_road_for_player = function(player_id) {
  var longest_road = 0;
  console.log("Finding longest road for player", player_id);
  for (var r=0; r<this.roads.length; r++) {
    if (this.roads[r].owner === player_id) {
      // get node at each end and see if there's any owned roads attached to them
      // determine a starting point (first road in series)
      var node_0 = this.nodes[this.roads[r].connects[0]];
      var node_1 = this.nodes[this.roads[r].connects[1]];
      var owned_node_0_roads = 0;
      var owned_node_1_roads = 0;

      for (var n=0; n<node_0.n_roads.length; n++) {
        var road = this.roads[node_0.n_roads[n]];
        if (road.owner === player_id)
          owned_node_0_roads += 1;
      }
      for (var n=0; n<node_1.n_roads.length; n++) {
        var road = this.roads[node_1.n_roads[n]];
        if (road.owner === player_id)
          owned_node_1_roads += 1;
      }

      // determine direction to go if the road looks like a starting point
      if (owned_node_0_roads === 1 && owned_node_1_roads > 1) {
        var tmp = this.longest_road(node_1, player_id, 1, this.roads[r].id);
        longest_road = (longest_road <= tmp ? tmp : longest_road);
      }
      else if (owned_node_0_roads > 1 && owned_node_1_roads === 1) {
        var tmp = this.longest_road(node_0, player_id, 1, this.roads[r].id);
        longest_road = (longest_road <= tmp ? tmp : longest_road);
      }
      // special case
      else if (owned_node_0_roads === 1 && owned_node_1_roads === 1) {
        longest_road = 1;
      }
    }
  }
  console.log("Longest road for player", player_id, "is", longest_road);
  return longest_road;
}

/**
* Returns length of longest road from the starting node
* @param      {Obj}   node - a BuildNode object
* @param  {Integer} length - road length so far
* @param  {Integer}   last - the last road ID
* @return {Integer} - length of the longest road this player owns
*/
Board.prototype.longest_road = function(node, player_id, length=0, last=0) {
  var road_count = node.n_roads.length;
  for (var r=0; r<road_count; r++) {
    var road = this.roads[node.n_roads[r]];
    if (road.id != last && road.owner === player_id) {
      var next_node_id = (node.id == road.connects[0] ? road.connects[1] : road.connects[0]);
      // get node object
      var next_node = this.nodes[next_node_id];
      // append road leading to this node to the count
      var next_len = this.longest_road(next_node, player_id, length+1, road.id);
      length = (length < next_len ? next_len : length);
    }
  }
  return length;
}

/********************************************
*  Misc
*********************************************/

/*
*  A Points object for storing coordinates - forces integer
*/
function Point(x,y) {
  this.x = parseInt(x);
  this.y = parseInt(y);
}

function RoadNode(connects) {
  this.id = -1;
  this.connects = connects; // nodes that are neighbours of this node
  this.owner = -1;
  this.status = "";         //  Client state while player is interacting with board
}

function BuildNode(n_tiles) {
  this.id = -1;
  this.n_tiles = n_tiles;   // tiles this node intersects
  this.n_nodes = [];        // nodes that are neighbours of this node
  this.n_roads = [];
  this.building = "";       //
  this.owner = -1;
  this.status = "";         //  Client state while player is interacting with board
}

function TileNode(type, robber, token, asso) {
  this.type = type;
  this.robber = robber;
  this.token = token;
  this.associated_nodes = asso;
}

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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Board: Board, Point: Point, TileNode: TileNode, RoadNode: RoadNode, BuildNode: BuildNode };
}
