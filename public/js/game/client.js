//  Our websocket
var socket = io();
var actions = [];

var game_data = {};

var building_dimension = 50;

$(document).ready(function() {

    var $doc = $(document);

    //    Show the initial menu
    buildPopup("start_menu", false);    
  
    // Events for main start menu buttons
    $doc.on('click', '.js-start-toggle', function(e) {
        e.preventDefault();
        var active_class = $(this).attr('data-target');
        buildPopup("start_" + active_class, false);
    });

    // Request to join a game
    $doc.on('click', '.js-start-game', function() {
        var name = $('#txt_player1').val();
        if (name == '') {
            // TODO: Could replace with nicer notification system?
            alert("Please enter a name!");
            return;
        }

        socket.emit('join_request', {
            name: name
        });
    });

    //  Create local player after join
    socket.on('player_id', function (data) {
        current_player = new currentPlayer(data.name, data.id, data.colour);
        setupPlayer();
        buildPopup("waiting_for_players", false);
    });

    // Update the waiting display as new players join the game
    socket.on('player_joined', function (data) {
        var popupData = [
            ["player_count", data.player_count], 
            ["players_needed", data.max_players], 
        ];
        buildPopup("waiting_for_players", false, popupData);
    });

    // Detect the game starting
    socket.on('game_start', function (data) {
        buildPopup("waiting_for_turn", false);
    });

    socket.on('game_turn', function (data) {
        playerSetup(data);
    });

    // Detect the game starting
    socket.on('build_board', function (data) {
        board = JSON.parse(data);

        //  Build tiles
        var _html = "";
        for (var i=0; i< board.tiles.length; i++) {
            var row = board.tiles[i];
            for (var j=0; j<row.length; j++) {
                _html += buildTile(row[j], i, j);
            }
        }
        $(".board").html(_html);
    });

    socket.on('update_game', function (data) {
        //  This method should receive a game_data object
        //      players     : map of players
        //      board       : the main board object
        //      round_num   : the current round #
        game_data = data;

        //  verify that each node is on the interface in the
        //  right place/configuration
        for (var i=0; i< game_data.board.tiles.length; i++) {
            var row = game_data.board.tiles[i];
            for (var j=0; j<row.length; j++) {
               if (row[j].type != "water") {
                    buildNodes(row[j], j, i);
                }
            }
        }

        //  Insert holders for all roads
        buildRoads();
        
        //  Update drag and drop
        setupDragDrop();
    });

    //  During the setup phase, each player waits until their 
    //  turn, while the active player places a settlement and road
    var playerSetup = function (data){
        if (data.data_type === "setup_complete" ){
            alert("setup complete");
            hidePopup();
        }else if(data.data_type === 'setup_phase'){
            if (data.player !== 0) {
                if(data.player === 1){
                    //TODO: Place First Settlement
                    buildPopup("setup_phase_your_turn", false);
                }else{
                    //TODO: Place Second Settlement
                    buildPopup("setup_phase_your_turn", false);
                }
            } else {
                buildPopup("waiting_for_turn", false);
            }
        }
    }
    $doc.on('click', '.finishturnbutton', function(e) {
        e.preventDefault();
        //TODO: Add real data
        var data_package = new Data_package();
        data_package.data_type = "setup_phase";
        data_package.player_id = current_player.id;
        data_package.actions = actions; 
        update_server("game_update", data_package);

    });


    /*
    
    New events for upcoming html templates

    */

    //  Trade - click on resource to give
    $doc.on('click', '.card_give', function(e) {
        e.preventDefault();

        //  TODO: validate # of given resource
        var resource = $(this).attr('data-resource');
        var image = $(".card_receive[data-resource='" + resource + "']").html();
        $('.trade_give_box').html(image);

    });

    //  Trade - click on resource to receive
    $doc.on('click', '.card_receive', function(e) {
        e.preventDefault();

        //  TODO: validate # of given resource
        var resource = $(this).attr('data-resource');
        var image = $(".card_receive[data-resource='" + resource + "']").html();
        $('.trade_receive_box').html(image);
    });
    
    //  Year of Plenty - click on resource to receive
    $doc.on('click', '.year_receive', function(e) {
        e.preventDefault();

        //  TODO: validate # of given resource
        var resource = $(this).attr('data-resource');
        var image = $(".year_receive[data-resource='" + resource + "']").html();

        var card1 = $(".year_box_card1").html();
        var card2 = $(".year_box_card2").html();
        if (card1.length == 0) {
            $('.year_box_card1').html(image);
        } else if (card2.length == 0) {
            $('.year_box_card2').html(image);
        }
    });

    //  Year of Plenty - clear selected resource
    $doc.on('click', '.year_box_card', function(e) {
        e.preventDefault();
        $(this).html("");
    });
    
    //  Monopoly - 
    $doc.on('click', '.monopoly_receive', function(e) {
        e.preventDefault();

        //  TODO: validate # of given resource
        var resource = $(this).attr('data-resource');
        var image = $(".monopoly_receive[data-resource='" + resource + "']").html();
        $('.monopoly_card').html(image);
    });
    
    //  Development Card - 
    $doc.on('click', '.devcard_receive', function(e) {
        e.preventDefault();

        //  TODO: validate # of given resource
        var resource = $(this).attr('data-resource');
        var image = $(".devcard_receive[data-resource='" + resource + "']").html();
        $('.devcard_card').html(image);
    });
    
    //  Player Trading - Add Give Card 
    $doc.on('click', '.trade_card_give', function(e) {
        e.preventDefault();

        //  TODO: validate # of given resource
        var resource = $(this).attr('data-resource');
        var image = $(".trade_card_want[data-resource='" + resource + "']").html();
        $('.trade_give').html(image.replace("_small", "_tiny"));
    });
    
    //  Player Trading - Add Want Card 
    $doc.on('click', '.trade_card_want', function(e) {
        e.preventDefault();

        var resource = $(this).attr('data-resource');
        var image = $(".trade_card_want[data-resource='" + resource + "']").html();
        $('.trade_want').html(image.replace("_small", "_tiny"));
    });
    
    
});

var update_server = function(data_type, data){
    
    //data_type is a string, usually "game_update" , data is a data_package object
    socket.emit(data_type, data);
}

//  Generic method to build a popup from a template
//   popupClass: name of the html file without the extention
//   customData: array of paired values to replace corresponding tags in the html template (i.e. {player_name})
function buildPopup(popupClass, useLarge, customData) {
    $.get("templates/" + popupClass + ".html", function(data) {
        
        //  In a few cases, we need a larger popup
        $(".popup_inner").removeClass("popup_inner_large");
        if (useLarge) {
            $(".popup_inner").addClass("popup_inner_large");
        }

        //  Now load and update the template
        var html = data;
        if (customData) {
            customData.forEach(function(data) {
                html = html.replace("{" + data[0] + "}", data[1]);
            });
        }
        $(".popup_inner").html(html);
        $(".popup").show();

    });
}
function hidePopup() {
    $('.popup').fadeOut(400, function() {

    });
}

function buildTile(theTile, row, col) {
    //  We don't need the 1st water on even rows
    if ((row % 2) == 0 && col == 0) {
        return "";
    } else {
        var newTile = "<div class='hex";

        if (theTile.type == "water" || theTile.type == "harbor") {
            newTile += "_" + theTile.type;
            if (theTile.type == "harbor") {
                //newTile += " " + theTile.harborAlign;
            }
        } else {
            newTile += " " + theTile.type;
        }

        newTile += ((row % 2) != 0 && (col == 0 || col == 6) ? " half" : "") + "'>";
        if (theTile.type == "desert") {
            newTile += "<div class='robber'></div>";
        }
        if (theTile.type == "harbor") {
            //newTile += "<img src='images/ship_" + theTile.harbor + ".png' class='ship' />";
        }

        //  Set node placeholders
        if (theTile.type != "water" && theTile.type != "harbor") {
            //  We loop through all nodes on this tile
        }

        //  Set the number token if this tile has one
        if (theTile.type != "water" && theTile.type != "harbor" && theTile.type != "desert") {
            newTile += "<div class='token'><div class='number'>" + theTile.token + "<div class='dots'>" + getDots(theTile.token) + "</div></div></div>";
        }

        newTile += "</div>";

        return newTile;
    }
}

function getObjectPosition(x, y, nodeIndex) {
    var board_top_offset = 30 + 5 + 26;     //  Offset of board + board border + height of top row not shown
    var board_left_offset = 30 + 5 + 4;     //  Offset of board + board border + width of first column not shown
    var row_variance = 48;                  //  Each row moves 48px up more than the previous row (cummulative)

    var tile_width = 148;
    var tile_height = 172;

    //  Use the current width/height of each tile to find the starting x/y for the tile
    //  Even rows by bumping x by 1/2 of a tile_width
    //  All rows after the first 2 need to be bumped by the variance between the rows
    var new_x = (x * tile_width) - board_left_offset - ((y % 2) == 0 ? (tile_width/2) : 0);
    var new_y = (y * tile_height) - board_top_offset - (y > 1 ? ((y - 1) * row_variance) : 0);
    
    //  Nodes at 0, 1, 4 and 5 adjust to the center/right of the tile
    if (nodeIndex == 0 || nodeIndex == 5) { new_x += tile_width; }
    if (nodeIndex == 1 || nodeIndex == 4) { new_x += (tile_width / 2); }
    
    //  Nodes at 0, 1, 2, 3 and 5 adjust to the center/right of the tile
    if (nodeIndex == 0 || nodeIndex == 2) { new_y += (tile_height * 0.74); }
    if (nodeIndex == 3 || nodeIndex == 5) { new_y += (tile_height * 0.26); }
    if (nodeIndex == 1) { new_y += tile_height; }

    return [new_x, new_y];
}

function buildNodes(theTile, x, y) {
    //  Settlements are slightly shorter
    var settlement_height = 42;

    //  Now get the nodes and determine positions
    var node_positions = theTile.associated_nodes;
    var nodeHTML = "";
    
    if (node_positions.length > 0) {
        for (var j=0; j<node_positions.length; j++) {
            //  j is the position around the tile
            //  0 = bottom_right clockwise to 5 = top_right

            var node = game_data.board.nodes[node_positions[j]];
            var node_on_canvas = $("#node_" + node_positions[j]);
            var node_class = getNodeCSS(node);

            if (node_on_canvas.length == 0) {
                //  First we get the top x,y point of the Tile
                var point = getObjectPosition(x, y, j, false);

                //  Now subtract half the width/height object
                point[0] -= (building_dimension / 2);
                point[1] -= (node.building == "city" ? (building_dimension / 2) : (settlement_height / 2));

                //  temp
                if (x == 2 && y == 1 && j == 0) {
                    node.owner = 0;
                    node.building = "house";
                    node_class = getNodeCSS(node);
                }

                //  Finally create the html based on the node properties
                $("body").append("<div id='node_" + node_positions[j] + "' class='node " + node_class + "' style='top:" + point[1] + "px; left:" + point[0] + "px;'></div>");
            } else {
                //  The node exists on the board, update css in case it changed
                node_on_canvas.attr("class", "node " + node_class);
            }
        }
    }
}
function getNodeCSS(node) {
    var node_class = "disabled";
    if (canBuild(node)) {
        node_class = "buildspot";
    } else if (node.owner > -1) {
        node_class = node.building + " " + game_data.players[node.owner].colour;
    }
    return node_class;
}
function canBuild(node) {
    //  Is something already built here?
    if (node.owner > -1) { return false; }

    //  Next, we check to see if any adjacent node has a building
    for (var i=0; i<node.n_nodes.length; i++) {
        if (game_data.board.nodes[node.n_nodes[i]].owner > -1) {
            return false;
        }
    }

    //  If this is the setup round, we can build here
    if (game_data.round_num < 3) { return true; }

    //  Finally, if it is a normal round, are we connected by a road?
    for (var i=0; i<game_data.board.roads.length; i++) {
        for (var j=0; j<game_data.board.roads[i].connects.length; j++) {
            if (game_data.board.roads[i].connects[j].owner == current_player.id) {
                return true;
            }
        }
    }
    return false;
}

function buildRoads() {
    for (var i=0; i<game_data.board.roads.length; i++) {
        var road = game_data.board.roads[i];
        var road_on_canvas = $("#road_" + i);
        var road_class = getRoadCSS(road, i);

        if (road_on_canvas.length == 0) {
            //  First we get the top x,y point of the Tile
            var point = getRoadPosition(road);

            //  We need to know the angle (30, 90, 330)
            var angle = getRoadAngle(road);
        
            //  Finally create the html based on the road properties
            $("body").append("<div id='road_" + i + "' class='road " + road_class + " angle" + angle + "' style='top:" + point[1] + "px; left:" + point[0] + "px;'></div>");
        } else {
            //  The road exists on the board, update css in case it changed
            road_on_canvas.attr("class", "road " + road_class);
        }
    }
}

//  Method to determine whether road on canvas can be
//  built on, is already built or is not available
function getRoadCSS(road, index) {
    var road_class = "disabled";
    if (canBuildRoad(road, index)) {
        road_class = "ghost";
    } else if (road.owner > -1) {
        road_class = game_data.players[road.owner].colour;
    }
    return road_class;
}

//  Check nodes connected to this road to determine the
//  angle of this road
function getRoadAngle(road) {
    var node1_left = $("#node_" + road.connects[0]).css("left").replace("px", "");
    var node2_left = $("#node_" + road.connects[1]).css("left").replace("px", "");

    if (node1_left == node2_left) {
        return 90;
    } else {
        if (parseInt(node1_left) > parseInt(node2_left)) {
            return 30;
        } else {
            return 330;
        }
    }
}

function getRoadPosition(road) {
    var node1_left = parseInt($("#node_" + road.connects[0]).css("left").replace("px", ""));
    var node1_top = parseInt($("#node_" + road.connects[0]).css("top").replace("px", ""));
    var node2_left = parseInt($("#node_" + road.connects[1]).css("left").replace("px", ""));
    var node2_top = parseInt($("#node_" + road.connects[1]).css("top").replace("px", ""));

    //  Angled road
    var road_width = 65;
    var road_height = 52;
    if (node1_left == node2_left) {
        //  Vertical road
        road_width = 25;
        road_height = 60;
    }

    //  Find the difference based on the size of the road
    var left_diff = (0.5 * Math.abs((node1_left - node2_left)) - (0.5 * road_width));
    var top_diff = (0.5 * Math.abs((node1_top - node2_top)) - (0.5 * road_height));
    
    //  Assume a 330 degree angle first
    var new_x = node1_left + (0.5 * building_dimension);
    if (node1_left == node2_left) {
        //  Vertical road (90 degrees)
        new_x = node2_left + (0.5 * building_dimension) - (0.5 * road_width);
    } else if (node1_left > node2_left) {
        //  30 degrees
        new_x = node2_left + left_diff + (0.5 * building_dimension);
    }

    //  Assume a 330 degree angle first
    var new_y = node1_top - top_diff - (0.5 * building_dimension);
    if (node1_left == node2_left) {
        //  Vertical road (90 degrees)
        new_y = (node2_top > node1_top ? node1_top : node2_top) + (0.5 * top_diff) + (0.5 * building_dimension);
    } else if (node1_top > node2_top) {
        //  30 degrees
        new_y = node2_top + top_diff + (0.5 * building_dimension);
    }

    return [new_x, new_y];
}

//  Some simple logic to see if a road can be built
function canBuildRoad(road, index) {
    //  Is something already built here?
    if (road.owner > -1) {
        return false;
    }

    //  Do we have an adjacent building or road?
    var tempBoard = new Board();
    tempBoard.roads = game_data.board.roads;
    tempBoard.nodes = game_data.board.nodes;
    return tempBoard.is_road_valid_build(current_player.id, index);
}


function getDots(d) {
    if (d == 2 || d == 12) {
        return ".";
    }
    if (d == 3 || d == 11) {
        return "..";
    }
    if (d == 4 || d == 10) {
        return "...";
    }
    if (d == 5 || d == 9) {
        return "....";
    }
    if (d == 6 || d == 8) {
        return ".....";
    }
}

function validateNode(neighbors, index, nodeindex) {
    if (neighbors[index] != null) {
        if (neighbors[index].nodes != null) {
            if (neighbors[index].nodes.length > nodeindex) {
                return neighbors[index].nodes[nodeindex];
            }
        }
    }
    return null;
}

function setupPlayer() {
    //  For the first time here, create the structure
    var html = "";
    html += "        <div class='row'>";
    html += "            <div class='player'><img src='images/player" + current_player.id + ".png' /></div>";
    html += "            <div class='playername'>" + current_player.name;
    html += "               <div class='playerbutton'>";
    html += "                   <div class='btn btn-info finishturnbutton'>Finish Turn</div>";
    html += "               </div>";
    html += "            </div>";
    html += "        </div>";
    html += "        <div class='resources'>";
    html += "            Resources:<br />";
    html += "            <div class='box brick'><span class='brickcount'>0</span></div>";
    html += "            <div class='box lumber'><span class='lumbercount'>0</span></div>";
    html += "            <div class='box sheep'><span class='sheepcount'>0</span></div>";
    html += "            <div class='box ore'><span class='orecount'>0</span></div>";
    html += "            <div class='box grain'><span class='graincount'>0</span></div>";
    html += "            <div class='box trade'><div class='btn btn-info tradebutton' onclick='openTrade();'>Trade</div></div>";
    html += "        </div>";
    html += "        <div class='buildings'>";
    html += "            Buildings:<br />";
    html += "            <div class='housebox_disable'></div>";
    html += "            <div class='housebox'>";
    html += "                <span class='housecount'>5</span>";
    for (var i = 0; i < 5; i++) {
        html += "                <div id='house_red_" + i + "' class='house red' ></div>";
    }
    html += "            </div>";
    html += "            <div class='citybox_disable'></div>";
    html += "            <div class='citybox'>";
    html += "                <span class='citycount'>4</span>";
    for (var i = 0; i < 4; i++) {
        html += "                <div id='city_red_" + i + "' class='city red' ></div>";
    }
    html += "            </div>";
    html += "            <div class='roadbox_disable'></div>";
    html += "            <div class='roadbox'>";
    html += "                <span class='roadcount'>15</span>";
    for (var i = 0; i < 15; i++) {
        html += "                <div id='road_red_" + i + "' class='road red angle30' ></div>";
    }
    html += "            </div>";
    html += "        </div>";
    html += "            <div class='cards'>";
    html += "                Cards:<br />";
    html += "                <div class='cardlist'><img src='../images/nocards.png' /></div>";
    html += "                <div class='buy'><div class='btn btn-info buybutton'>Buy Development Card</div></div>";
    html += "            </div>";
    html += "           <div class='bonuses'>";
    html += "               Bonuses:<br />";
    html += "               <div class='box bigarmy'><span class='armycount'>0</span></div>";
    html += "               <div class='box longroad'><span class='longroadcount'>0</span></div>";
    html += "               <div class='box victory'><span class='victorycount'>0</span></div>";
    html += "            </div>";

    $(".score").html(html);
}

function doLog(m) {
    $(".log").append(m + "<br />");
}