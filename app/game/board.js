
/*
    This is based on the original prototype seutp
*/
function Board() {
    //  The index of the number list below to be used (randomly chosen on game start)
    this.numberToUse = -1;

    //  The index of the next number tile to be set
    this.numberPosition = 0;

    //  The six valid sequences which we can randomly pick from
    this.numberTiles = [
        [5, 10, 8, 2, 9, 3, 4, 6, 11, 6, 11, 3, 4, 5, 12, 8, 10, 9],
        [8, 4, 11, 10, 11, 3, 12, 5, 9, 6, 9, 2, 4, 5, 10, 6, 3, 8],
        [11, 12, 9, 4, 3, 6, 10, 8, 11, 5, 8, 10, 9, 4, 3, 5, 2, 6],
        [9, 10, 8, 12, 6, 5, 3, 11, 3, 4, 6, 4, 11, 9, 2, 8, 10, 5],
        [8, 3, 6, 10, 5, 4, 2, 9, 6, 9, 5, 12, 3, 11, 10, 11, 4, 8],
        [5, 10, 8, 2, 9, 3, 4, 6, 11, 6, 11, 3, 4, 5, 12, 8, 10, 9]
    ];

    //  Counts of each type of hex
    this.tileStart = [
        ['brick', 'brick', 'brick'],
        ['lumber', 'lumber', 'lumber', 'lumber'],
        ['grain', 'grain', 'grain', 'grain'],
        ['sheep', 'sheep', 'sheep', 'sheep'],
        ['ore', 'ore', 'ore'],
        ['desert']
    ];
    this.tileStartCount = 19;

    this.harborPosition = 0;
    this.harborStart = [
        ['3to1', '3to1', '3to1', '3to1'],
        ['brick'],
        ['lumber'],
        ['ore'],
        ['grain'],
        ['sheep']
    ];
    this.harborAlign = ['bottom_right', 'bottom_left', 'bottom_right', 'left', 'right', 'left', 'top_right', 'top_right', 'top_left'];
    this.harborStartCount = 9;

    //  Board will be a 7x7 grid
    //  W = water tile, H = harbor tile, X = hex tile
    this.boardLayout = [
            ['W', 'W', 'H', 'W', 'H', 'W', 'W'],
        ['W', 'H', 'X', 'X', 'X', 'W', 'W'],
            ['W', 'X', 'X', 'X', 'X', 'H', 'W'],
        ['H', 'X', 'X', 'X', 'X', 'X', 'W'],
            ['W', 'X', 'X', 'X', 'X', 'H', 'W'],
        ['W', 'H', 'X', 'X', 'X', 'W', 'W'],
            ['W', 'W', 'H', 'W', 'H', 'W', 'W']
    ];

    //  Position of each hex type
    this.tilePosition = 0;
    this.tileList = [];

    //  Object that holds the board array
    this.board = [[], [], [], [], [], [], []];
    this.nodes = [];
}

Board.prototype.getGameData = function() {
    var gameData = new GameData(this.board, this.nodes);
    return gameData;
}

/*
    Primary method to create the board layout
*/
Board.prototype.createBoard = function() {
    //  Use a random setup of resources
    this.buildTileList();

    //  Pick a number sequence to use
    this.numberToUse = Math.floor(Math.random() * 6);

    //  Create all the tiles
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 7; j++) {
            var tileIndex = -1;
            var tileType = this.boardLayout[i][j]
            if (tileType == "X") {
                tileType = this.tileList[this.tilePosition];
                tileIndex = this.tilePosition;
                this.tilePosition++;
            } else if (tileType == "H") {
                tileType = "harbor";
            } else if (tileType == "W") {
                tileType = "water";
            }

            var newTile = new tile(tileIndex, tileType, i, j);

            //  Set harbor as needed
            if (tileType == "harbor") {
                newTile.harbor = this.getHarbor();
                newTile.harborAlign = this.harborAlign[this.harborPosition];
                this.harborPosition++;
            }

            //  Set tile as we reach each spot
            if (tileType != "desert" && tileType != "water" && tileType != "harbor") {
                newTile.token = this.numberTiles[this.numberToUse][this.numberPosition];
                this.numberPosition++;
            }

            this.board[i].push(newTile);
        }
    }

    //  Create the nodes around each tile
    this.buildNodes();
}

/*
    This method creates a random list of tiles for the board
*/
Board.prototype.buildTileList = function() {
    var done = false;
    do {
        var r = Math.floor(Math.random() * 7)
        if (this.tileStart[r]) {
            if (this.tileStart[r].length > 0) {
                var h = this.tileStart[r].pop();
                this.tileList.push(h);
                this.tileStartCount--;
            }
        }
        
        done = (this.tileStartCount <= 0);
    }
    while (!done);
}

/*
    Create a random order for the harbors
*/
Board.prototype.getHarbor = function() {
    var done = false;
    do {
        var r = Math.floor(Math.random() * 7)
        if (this.harborStart[r]) {
            if (this.harborStart[r].length > 0) {
                var h = this.harborStart[r].pop();
                this.harborStartCount--;
                return h;
            }
        }

        done = (this.harborStartCount <= 0);
    }
    while (!done);
}

/*
    Creation of nodes around each resource tile
*/
Board.prototype.buildNodes = function() {
    //  To avoid circular references, this has been changed to a single array
    //  Each node has a unique ID, which the tile keeps in a simple lookup array

    //  Each tile has 11 nodes surrounding it
    //  Create as needed, otherwise connect up nodes for each tile

    //  Due to some css limitations with layers, we need to create nodes
    //  from bottom to top

    for (var i = 5; i > 0; i--) {
        for (var j = 5; j > 0; j--) {
            var nextTile = this.board[i][j];
            //  We only need resource tiles
            if (nextTile.id >= 0) {
                for (var x = 0; x < 12; x++) {
                    var currentNode = this.findNode(x, nextTile, i, j);
                    if (currentNode != null) {
                        nextTile.nodes.push(currentNode.arrayIndex);
                    } else {
                        var newNode = new node(nextTile.id, x, this.nodes.length);
                        nextTile.nodes.push(this.nodes.length);
                        this.nodes.push(newNode);
                    }
                }
            }
        }
    }

    //  For easier management later, get each neighboring node
    for (var i = 5; i > 0; i--) {
        for (var j = 5; j > 0; j--) {
            var nextTile = this.board[i][j];
            //  We only need resource tiles
            if (nextTile.id >= 0) {
                this.getNodeNeighbors(nextTile);
            }
        }
    }

}

/*
    Methods to redesign and make more dynamic
*/

//  I used this method to make sure that each intersection only exists once, even 
//  If it is associated with multiple tiles.  This makes management of settlements, 
//  roads and cities easier later on
Board.prototype.findNode = function(nodeIndex, theTile, row, col) {
    var isEven = ((row % 2) == 0);
    var theNode = {};

    var newRow = -1;
    var newCol = -1;
    var newNode = -1;

    //  Nodes 0-1, 11
    if (row > 0 && (nodeIndex < 2 || nodeIndex == 11)) {
        newRow = row - 1;
        newCol = (nodeIndex == 11 ? (isEven ? col : col - 1) : (isEven ? col + 1 : col));
        newNode = (nodeIndex == 0 ? 8 : (nodeIndex == 1 ? 7 : 5));
    }

    //  Nodes 2-4
    if (col < 6 && (nodeIndex > 1 && nodeIndex < 5)) {
        newRow = row;
        newCol = col + 1;
        newNode = (nodeIndex == 2 ? 10 : (nodeIndex == 3 ? 9 : 8));
    }

    //  Node 5-8
    if (row < 6 && (nodeIndex > 4 && nodeIndex < 9)) {
        newRow = row + 1;
        newCol = (nodeIndex == 5 ? (isEven ? (col < 6 ? col + 1 : -1) : col) : (isEven ? col : (col > 0 ? col - 1 : -1)));
        newNode = (nodeIndex == 5 ? 11 : (nodeIndex == 6 ? 2 : (nodeIndex == 7 ? 1 : 0)));
    }

    //  Node 9-10
    if (col > 0 && (nodeIndex == 9 || nodeIndex == 10)) {
        newRow = row;
        newCol = col - 1;
        newNode = (nodeIndex == 9 ? 3 : 2);
    }

    if (newRow >= 0 && newCol >= 0 && newNode >= 0) {
        theNode = this.nodes[this.board[newRow][newCol].nodes[newNode]];
        //theNode = this.board[newRow][newCol].nodes[newNode];
    }

    if (theNode != null) {
        if (theNode.type != "water" && theNode.type != "harbor") {
            return theNode;
        }
    }
    return null;
}

Board.prototype.getTileNeighbors = function(tile) {
    var isEven = ((tile.row % 2) == 0);
    var neighbors = [];
    var node = [{}, {}, {}, {}, {}, {}];

    //  Up left
    node = (isEven ? this.board[tile.row - 1][tile.col] : this.board[tile.row - 1][tile.col - 1]);
    neighbors[0] = node;

    //  Up Right
    node = (isEven ? this.board[tile.row - 1][tile.col + 1] : this.board[tile.row - 1][tile.col]);
    neighbors[1] = node;

    //  left
    node = this.board[tile.row][tile.col - 1];
    neighbors[2] = node;

    //  right
    node = this.board[tile.row][tile.col + 1];
    neighbors[3] = node;

    //  bottom left
    node = (isEven ? this.board[tile.row + 1][tile.col] : this.board[tile.row + 1][tile.col - 1]);
    neighbors[4] = node;

    //  bottom right
    node = (isEven ? this.board[tile.row + 1][tile.col + 1] : this.board[tile.row + 1][tile.col]);
    neighbors[5] = node;

    return neighbors;
}

Board.prototype.getNodeNeighbors = function(tile) {
    var neighbors = this.getTileNeighbors(tile);

    //!!    Add code to remove nodes where a different colour house blocks

    //  Build spot neighbors are just the adjacent build spots

    //  Node 0 neighbors
        //  Node 2 and 10 on this tile
        this.nodes[tile.nodes[0]].neighbors.push(tile.nodes[2]);
        this.nodes[tile.nodes[0]].neighbors.push(tile.nodes[10]);
        
        //  Node 2 Up-left and Node 10 up-right
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[0].nodes[2] ? neighbors[0].nodes[2] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[1].nodes[10] ? neighbors[1].nodes[10] : null);

    //  Node 2 neighbors
        //  Node 0 and 4 on this tile
        this.nodes[tile.nodes[2]].neighbors.push(tile.nodes[0]);
        this.nodes[tile.nodes[2]].neighbors.push(tile.nodes[4]);

        //  right tile 0 or top right 4
        this.nodes[tile.nodes[2]].neighbors.push(neighbors[3].nodes[0] ? neighbors[3].nodes[0] : null);
        this.nodes[tile.nodes[2]].neighbors.push(neighbors[2].nodes[4] ? neighbors[2].nodes[4] : null);

    //  Node 4 neighbors
        //  Node 2 and 6 on this tile
        this.nodes[tile.nodes[4]].neighbors.push(tile.nodes[2]);
        this.nodes[tile.nodes[4]].neighbors.push(tile.nodes[6]);
        //  right tile 6 or bottom right 2
        this.nodes[tile.nodes[4]].neighbors.push(neighbors[3].nodes[6] ? neighbors[3].nodes[6] : null);
        this.nodes[tile.nodes[4]].neighbors.push(neighbors[5].nodes[2] ? neighbors[5].nodes[2] : null);

    //  Node 6 neighbors
        //  Node 8 and 4 on this tile
        this.nodes[tile.nodes[6]].neighbors.push(tile.nodes[4]);
        this.nodes[tile.nodes[6]].neighbors.push(tile.nodes[8]);
        //  bottom left  4 or bottom right 8
        this.nodes[tile.nodes[6]].neighbors.push(neighbors[4].nodes[4] ? neighbors[4].nodes[4] : null);
        this.nodes[tile.nodes[6]].neighbors.push(neighbors[5].nodes[8] ? neighbors[5].nodes[8] : null);

    //  Node 8 neighbors
        //  Node 10 and 6 on this tile
        this.nodes[tile.nodes[8]].neighbors.push(tile.nodes[6]);
        this.nodes[tile.nodes[8]].neighbors.push(tile.nodes[10]);
        //  left 4 or bottom left 0
        this.nodes[tile.nodes[8]].neighbors.push(neighbors[2].nodes[4] ? neighbors[2].nodes[4] : null);
        this.nodes[tile.nodes[8]].neighbors.push(neighbors[4].nodes[0] ? neighbors[4].nodes[0] : null);

    //  Node 10 neighbors
        //  Node 0 and 8 on this tile
        this.nodes[tile.nodes[10]].neighbors.push(tile.nodes[0]);
        this.nodes[tile.nodes[10]].neighbors.push(tile.nodes[8]);
        //  left 2 or upper left 6
        this.nodes[tile.nodes[10]].neighbors.push(neighbors[2].nodes[2] ? neighbors[2].nodes[2] : null);
        this.nodes[tile.nodes[10]].neighbors.push(neighbors[0].nodes[6] ? neighbors[0].nodes[6] : null);

    //  Road spot neighbors include adjacent build and road spots

        //  For all roads, neighbors on the same tile are the 2 before and 2 after
        for (var j = 1; j < 12; j = j + 2) {
            if (j == 1) {
                this.nodes[tile.nodes[j]].neighbors.push(tile.nodes[11]);
            } else {
                this.nodes[tile.nodes[j]].neighbors.push(tile.nodes[j - 2]);
            }
            this.nodes[tile.nodes[j]].neighbors.push(tile.nodes[j - 1]);
            if (j == 11) {
                this.nodes[tile.nodes[j]].neighbors.push(tile.nodes[0]);
                this.nodes[tile.nodes[j]].neighbors.push(tile.nodes[1]);
            } else {
                this.nodes[tile.nodes[j]].neighbors.push(tile.nodes[j + 1]);
                this.nodes[tile.nodes[j]].neighbors.push(tile.nodes[j + 2]);
            }
        }

    //  The rest are on adjacent tiles

    //  Node 1 neighbors
        //  Node 3 Up-left and Node 9 up-right
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[0].nodes[3] ? neighbors[0].nodes[3] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[1].nodes[9] ? neighbors[1].nodes[9] : null);

    //  Node 3 neighbors
        //  Node 11 right, Node 7 right, Node 5 up-right, Node 1 down-right
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[3].nodes[11] ? neighbors[3].nodes[11] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[3].nodes[7] ? neighbors[3].nodes[7] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[1].nodes[5] ? neighbors[1].nodes[5] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[5].nodes[1] ? neighbors[5].nodes[1] : null);

    //  Node 5 neighbors
        //  Node 7 right, Node 1 down-right, Node 9 down-right, Node 3 down-left
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[3].nodes[7] ? neighbors[3].nodes[7] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[5].nodes[1] ? neighbors[5].nodes[1] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[5].nodes[9] ? neighbors[5].nodes[9] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[4].nodes[3] ? neighbors[4].nodes[3] : null);

    //  Node 7 neighbors
        //  Node 9 down-right, Node 3 down-left, Node 11 down-left, Node 5 left
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[5].nodes[9] ? neighbors[5].nodes[9] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[4].nodes[3] ? neighbors[4].nodes[3] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[4].nodes[11] ? neighbors[4].nodes[11] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[2].nodes[5] ? neighbors[2].nodes[5] : null);

    //  Node 9 neighbors
        //  Node 1 left, Node 7 up-left, Node 5 left, Node 11 down-left
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[2].nodes[1] ? neighbors[2].nodes[1] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[0].nodes[7] ? neighbors[0].nodes[7] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[2].nodes[5] ? neighbors[2].nodes[5] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[4].nodes[11] ? neighbors[4].nodes[11] : null);

    //  Node 11 neighbors
        //  Node 3 up-left, Node 9 up-right, Node 7 up-left, Node 1 left
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[0].nodes[3] ? neighbors[0].nodes[3] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[1].nodes[9] ? neighbors[1].nodes[9] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[0].nodes[7] ? neighbors[0].nodes[7] : null);
        this.nodes[tile.nodes[0]].neighbors.push(neighbors[2].nodes[1] ? neighbors[2].nodes[1] : null);
}

function tile(index, tileType, row, col) {
    //  Tiles with resources are given an id from 0 to the #of resource tiles
    this.id = index;

    //  We keep the row and col for neighbor lookups
    this.row = row;
    this.col = col;

    //  Lumber, Grain, Sheep, Brick, Ore, Desert, Water
    this.type = tileType;
    this.harbor = "";
    this.harborAlign = "";

    //  The die number for this tile
    this.token = -1;

    //  The node objects surrounding this tile
    //  This is just an int pointing to the main node array
    this.nodes = [];
}
function node(tileID, index, arrayIndex) {
    //  Position around tile (0-11)
    this.id = index;

    //  The id in the main array
    this.arrayIndex = arrayIndex;

    //  If we are given a tile ID, this is used for drawing the node positions on the board (front end only)
    this.tileID = tileID;

    //  What kind of spot is this?
    this.type = ((index % 2) == 0 ? 'buildspot' : 'roadspot');

    //  Are we holding someone's settlement/city/road
    this.structure = "";
    this.owner = {};

    //  Surrounding nodes
    //  This is just an int pointing to the main node array
    this.neighbors = [];
}

function GameData(board, nodes) {
    this.board = board;
    this.nodes = nodes;
}


module.exports = Board;