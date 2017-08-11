/*
    This is based on the original prototype seutp

    Pros:   Calculates node positions better
*/


function Board_Idea2() {
    // Standard layout (as seen in the manual)
    // even # row is moved over by tile_width/2
    this.base_board = [
        ["z0",  "z0",  "z0",  "z0",  "z0",  "z0",  "z0"],
        ["z0",  "z0",  "e11", "b12", "d9",  "z0",  "z0"],
        ["z0",  "z0",  "a4",  "c6",  "a5",  "b10", "z0"],
        ["z0",  "f0",  "e3",  "d11", "e4",  "d8",  "z0"],
        ["z0",  "z0",  "a8",  "b10", "b9",  "c3",  "z0"],
        ["z0",  "z0",  "c5",  "d2",  "e6",  "z0",  "z0"],
        ["z0",  "z0",  "z0",  "z0",  "z0",  "z0",  "z0"]
    ];

    // Global map of nodes used in many functions
    this.node_array = [];
    this.road_array = [];
    this.tile_array = [];

}

/*
*  Takes a 2D array
*
* Numbers in grid determine the tile type
*/
Board_Idea2.prototype.build_nodes = function() {
    // iterate over the input this.base_board
    for (var y in this.base_board) {
        this.tile_array.push([]);
        for (var x in this.base_board) {
            // insert tile_node from info
            var tile_info = this.base_board[y][x].match(/([A-Za-z]+)([0-9]+)/);
            var tile_type = this.get_tile_type(tile_info[1]);
            this.tile_array[y].push(
                new TileNode(
                    tile_type,
                    (tile_type === "Desert"),
                    parseInt(tile_info[2])
                )
            );
            // then iterate over surrounding intersections for tile (corners)
            tile_node_loop:
            for (node of this.get_nodes(new Point(x,y))) {
                // check to make sure the node is not already in the set by
                // comparing the bordering tiles
                // TODO: find a way to limit big-oh complexity of this check
                //       not a major issue since this function only runs once per game
                for (p_node of this.node_array) {
                    // checking the neighbour tiles of the node tells us if it is
                    // in the same intersection, and thus to avoid adding it
                    if (this.has_array_points(p_node.n_tiles, node.n_tiles) >= 3) {
                        break tile_node_loop; // break to outer loop
                    }
                }
                // if loop not broken then it must be okay to add the node
                this.node_array.push(node);
            }
        }
    }
    // iterate over node_map for each node in the map and find neighbours
    for (var i=0; i < this.node_array.length; i++) {
        this.fill_node_neighbours_roads(this.node_array[i], i)
    }
}

/// Count how many Points are the same in each array
Board_Idea2.prototype.has_array_points = function(a1, a2) {
    var count = 0;
    for (var i in a1) {
        for (var j in a2) {
            if (a1[i].x === a2[j].x && a1[i].y === a2[j].y) {
                count += 1;
            }
        }
    }
    return count
}

Board_Idea2.prototype.get_tile_type = function (t) {
    if (t === 'a') {
        return "brick"
    } else if (t === 'b') {
        return "sheep"
    } else if (t === 'c') {
        return "ore"
    } else if (t === 'd') {
        return "grain"
    } else if (t === 'e') {
        return "lumber"
    } else if (t === 'f') {
        return "desert"
    } else if (t === 'z') {
        return "water"
    }
}

/*
*  Takes a tuple (x,y) representing the tile coords
*
*  Pushes new nodes and their hash in to hashmap
*/
Board_Idea2.prototype.get_nodes = function(coords) {
    var x = coords.x;
    var y = coords.y;
    // adj_x is for getting the pos of tiles in the above or below rows
    var adj_x = x;

    // if coords.y is even
    if (coords.y % 2 === 0) {
        adj_x += 1;
    }
    // The nodes are found by the coords of their neighbour tiles
    // it is done this way, rather than using a calculation to get hex_corners
    // so that we know which tiles are intersected by a node
    var top_left  = [new Point(adj_x,y-1), new Point(x,y), new Point(adj_x,y)];
    var top_mid   = [new Point(adj_x,y-1), new Point(x,y-1), new Point(x,y)    ];
    var top_right = [new Point(adj_x+1,y-1), new Point(x+1,y), new Point(x,y)    ];
    var bot_left  = [new Point(adj_x,y+1), new Point(x,y), new Point(adj_x,y)];
    var bot_mid   = [new Point(adj_x,y+1), new Point(x,y+1), new Point(x,y)    ];
    var bot_right = [new Point(adj_x+1,y+1), new Point(x+1,y), new Point(x,y)    ];

    return [new BuildNode(top_left ),
            new BuildNode(top_mid  ),
            new BuildNode(top_right),
            new BuildNode(bot_right),
            new BuildNode(bot_mid  ),
            new BuildNode(bot_left )];
}

/*
*  Takes a node Object and the objects index in the node_map
*
*  The function iterates over the node_map to find neighbouring nodes
*  and adds road nodes between them
*  Note: use only when all nodes have been added to the hashmap
*/
Board_Idea2.prototype.fill_node_neighbours_roads = function (node, node_index) {
    for (var n=0; n < this.node_array.length; n++) {
        // if n_node.n_tiles contains any combo of two of this nodes
        // neighbouring tiles then it is a neighbour node, keeping the indexes
        // of neighbour nodes within each node allows for easy traversval
        if (this.has_array_points(this.node_array[n].n_tiles, node.n_tiles) === 2 && n !== node_index) {
            // add the neighbour node index to the current node
            node.n_nodes.push(n);

            // now check for connections between this node and others
            // need to iterate over the array to make sure we don't add the
            // same road more than once
            var add_road = true;
            for (road of this.road_array) {
                // if the road exists connecting these node indexes, don't add
                // should be safe in JS since the comparison is between integers
                if (road.connects.indexOf(n) !== -1 &&
                    road.connects.indexOf(node_index) !== -1) {
                    add_road = false;
                    break;
                }
            }
            if (add_road)
                this.road_array.push(new RoadNode([n, node_index]));
        }
        // break early if we filled the neighbours
        if (node.n_nodes.length === 3) {
            break;
        }
    }
}

Board_Idea2.prototype.getGameData= function() {
    var gameData = new GameData(this.node_array, this.road_array, this.tile_array);
    return gameData;
}

/*
*  A Points object for storing coordinates - forces integer
*/
function Point(x,y) {
    this.x = parseInt(x);
    this.y = parseInt(y);
}
/*
*
*/
function TileNode(type, robber, token) {
    this.type = type;
    this.robber = robber;
    this.token = token;
}

/*
*
*/
function RoadNode(connects) {
    this.connects = connects; // nodes that are neighbours of this node
    this.owner = "";
}

/*
*
*/
function BuildNode(n_tiles) {
    this.n_tiles = n_tiles; // tiles this node intersects
    this.n_nodes = []; // nodes that are neighbours of this node
    this.building = "";//
    this.owner = "";
}

function GameData(nodes, roads, tiles) {
    this.nodes = nodes;
    this.roads = roads;
    this.tiles = tiles;
}

module.exports = Board_Idea2;
