//  Our websocket
var socket = io();

//server data is the round data from the server
var server_data = [];

var building_dimension = 50;

$(document).ready(function() {

    var $doc = $(document);

    //    Show the initial menu
    build_popup_start_menu();

    // Events for main start menu buttons
    $doc.on('click', '.js-start-toggle', function(e) {
        e.preventDefault();
        var active_class = $(this).attr('data-target');
        build_popup_start("start_" + active_class);
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
        build_popup_waiting_for_players([]);
    });

    // Update the waiting display as new players join the game
    socket.on('player_joined', function (data) {
        var popupData = [
            ["player_count", data.player_count],
            ["players_needed", data.max_players],
        ];
        build_popup_waiting_for_players(popupData);
    });

    // Detect the game starting
    socket.on('game_start', function (data) {
        build_popup_waiting_for_turn();
    });

    socket.on('game_turn', function (data) {
        server_data = data;
        resolve_game_turn(data);
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
        //  Update the local copy of the game data
        current_game = new currentGame(data);

        // DEBUG:
        console.log('current_game: ', current_game);

        turn_actions = [];

        // Update the game state panel
        updatePanelDisplay();

        //  Update all nodes on the board
        buildNodes();

        //  Insert holders for all roads
        buildRoads();

        //  Update drag and drop
        setupDragDrop();
    });

    //  During the setup phase, each player waits until their
    //  turn, while the active player places a settlement and road
    var resolve_game_turn = function (data){
        if(data.data_type === 'setup_phase'){
            if (data.player !== 0) {
                //  Popup for instructions on 1st or 2nd placement
                build_popup_setup_phase_your_turn(data.player);
            } else {
                //  Waiting for others to finish setup placement
                build_popup_waiting_for_turn();
            }

        }else if ( data.data_type === 'invalid_move'){
            //  Details on failed moves
            build_popup_failed_moves();

        }else if ( data.data_type === 'wait_others'){
            //  Normal round, waiting for others
            build_popup_round_waiting_for_others();
            
        }else if ( data.data_type === 'round_turn'){
            if (current_game.round_num == 3) {
                //  On the first round, we need to show the setup phase results
                build_popup_setup_complete();
                setup_phase = false;
            } else {
                //  Otherwise, we start with the dice popup
                build_popup_round_roll_results();
            }
        }else if (data.data_type === 'returned_trade_card'){
            // card received from bank trade
            console.log("trade_card_returned");
            current_player = data.player;
            updatePanelDisplay();
        }

        // wipe current turn data
        if ( data.data_type === 'successfull_turn'){
            setupTurnFinished();
        }
    }
    $doc.on('click', '.finishturnbutton', function(e) {
        e.preventDefault();

        //TODO: Add real data
        var data_package = new Data_package();
        data_package.data_type = "setup_phase";
        data_package.player_id = current_player.id;
        data_package.actions = turn_actions;

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

    //  Build - Add Extra resource
    $doc.on('click', '.build_give', function(e) {
        e.preventDefault();

        var resource = $(this).attr('data-resource');
        var card_list = $(".extra_card_list");
        var next_z = card_list.html().length + 1;
        var new_card = '<div class="extra_card" style="z-index:' + (600 + next_z) + ';"><img src="images/card_' + resource + '_small.png"></div>';
        card_list.append(new_card);
    });

    //  Build - Remove resources
    $doc.on('click', '.extra_card_list', function(e) {
        e.preventDefault();

        $(".extra_card_list").html("");
    });

    //close start window
    $doc.on('click', '.close-start', function(e) {
        e.preventDefault();

        hidePopup();
    });


});
function setupTurnFinished(){
    // wipe all current turn info (action arrays)
    turn_actions = [];
}

function openTrade () {
    
    //disable trade until setup complete
    if(current_game.round_num > 2){
        buildPopup('round_maritime_trade');
    }
    buildPopup('round_maritime_trade');
}

function acceptTrade () {
    var sendCards = $('#tgb');
    var receiveCard = $('#trb');
    console.log($(":first-child", sendCards).attr('class'));
    var data_package = new Data_package();
    data_package.data_type = 'trade_with_bank';
    data_package.player_id = current_player.id;
    var action = new Action();
    action.action_type = 'four-to-one';
    action.action_data = {
        cards_for_the_bank : $(":first-child", sendCards).attr('class'),
        cards_from_the_bank: $(":first-child", receiveCards).attr('class'),
        cards_for_trade    : 4
    }
    data_package.actions.push(action);
    console.log("send trade to bank");
    update_server( 'game_update' , data_package );
}
function invalidMove (data){

    failed_actions.forEach( function (action) {

        //  populate new array with the successful actions (and copy them into turn_actions)
        var successful_actions = [];

        if(action.action_result){
            successful_actions.push(action);
        }else{
            alert("need to remove failed item artifact");
            //inform of failed actions
            //remove relevant artifact from board
            if(action.action_type === 'road'){
                //TODO: action failed dialog with 'road'
            }else if(action.action_type === 'house'){
                //TODO: action failed dialog with 'road'
            }else if(action.action_type === 'city'){
                //TODO: action failed dialog with 'road'
            }else{

            }
        }
        turn_actions = successful_actions;
    });
}

function checkLegitimateTurn(data_package){
    console.log(turn_actions);
            //only two actions allowed (build road and build house)
            if(turn_actions.length === 2){

                console.log(turn_actions[1]);
                //if one is a house and the other is a road
                if ((turn_actions[0].action_type == 'build_settlement' || turn_actions[1].action_type == 'build_settlement') && (turn_actions[0].action_type == 'build_road' || turn_actions[1].action_type == 'build_road')){

                    update_server("game_update", data_package);
                    turn_actions = [];

                    //reset server data to avoid unexpected quirks
                    server_data = [];
                } else {
                    // TODO: wrong actions taken, clear actions and action object from turn_actions
                    alert('Please place a road and a settlement');

                }
            } else {
                //TODO dialogue - Wrong number of actions, clear actions and action object from turn_actions
                alert('You must build exactly one settlement and one connecting road.');
            }
}
var update_server = function(data_type, data){

    //data_type is a string, usually "game_update" , data is a data_package object
    socket.emit(data_type, data);
}

//  Method used to create the individual tiles when the board is first drawn
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

//  Method for updating the state of all nodes on the board
//  Iterates through the most recent game data to verify buildings
function buildNodes() {
    //  Grab a local reference of the tiles array
    var tiles = current_game.tiles;

    //  Settlements are slightly shorter
    var settlement_height = 42;

    //  Iterate through all tiles
    for (var y = 0; y < tiles.length; y++) {
        for (var x = 0; x < tiles[y].length; x++) {
            //  Next tile
            var theTile = tiles[y][x];
            if (theTile.type != "water") {
                //  Now get the nodes and determine positions
                var node_positions = theTile.associated_nodes;

                //  If there are nodes to check
                if (node_positions.length > 0) {
                    //  Check each node
                    for (var j=0; j<node_positions.length; j++) {
                        //  j is the position around the tile
                        //  0 = bottom_right clockwise to 5 = top_right

                        var node = current_game.nodes[node_positions[j]];
                        var node_on_canvas = $("#node_" + node_positions[j]);
                        var node_class = getNodeCSS(node);

                        if (node_on_canvas.length == 0) {
                            //  First we get the top x,y point of the Tile
                            var point = getObjectPosition(x, y, j);

                            //  Now subtract half the width/height of the city/settlement
                            point[0] -= (building_dimension / 2);
                            point[1] -= (node.building == "city" ? (building_dimension / 2) : (settlement_height / 2));

                            //  Finally create the html based on the node properties
                            $("body").append("<div id='node_" + node_positions[j] + "' class='node " + node_class + "' style='top:" + point[1] + "px; left:" + point[0] + "px;'></div>");
                        } else {
                            //  The node exists on the board, update css in case it changed
                            node_on_canvas.attr("class", "node " + node_class);

                            //  If a companion house/city exists, disable it
                            var dragged_node = $("#" + node.building + "_" + current_player.colour + "_pending_" + node.id);
                            if (dragged_node) {
                                dragged_node.attr("class", node.building + " " + current_player.colour + " disabled");
                                dragged_node.attr("id", node.building + "_" + current_player.colour + "_locked_" + node.id);
                            }

                        }
                    }
                }
            }
        }
    }
}

// Update display figuers
function updatePanelDisplay() {

  // Update the resouce cards

  var resource_cards = current_game.player.cards.resource_cards;
  var $resource_box = $('.resources');
  $resource_box.find('.brickcount').text(resource_cards.brick);
  $resource_box.find('.graincount').text(resource_cards.grain);
  $resource_box.find('.lumbercount').text(resource_cards.lumber);
  $resource_box.find('.orecount').text(resource_cards.ore);
  $resource_box.find('.sheepcount').text(resource_cards.sheep);

}

//  This method determines the coordinates where a settlement/city is to be drawn
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

//  This method sets the appropriate class based on the node state
function getNodeCSS(node) {
    var node_class = "disabled";
    if (can_build(node)) {
        node_class = "buildspot";
    } else if (node.owner > -1) {
      node_class = node.building + " locked " + current_game.players[node.owner].colour;
    }
    return node_class;
}

//  This method determines if a node can be built on by the current player
function can_build(node, node_to_ignore) {
    var success = false;

    //  If we have a node_to_ignore, temporarily hide it's owner/building properties
    var temp_node = new BuildNode();
    if (node_to_ignore) {
        temp_node.building = node_to_ignore.building;
        temp_node.owner = node_to_ignore.owner;
        node_to_ignore.building = "";
        node_to_ignore.owner = -1;
    }

    //  Use board helper method to check owner and adjacent buildings
    var tempBoard = new Board();
    tempBoard.nodes = current_game.nodes;
    var can_build = tempBoard.is_node_valid_build(current_player.id, node.id);

    //  TODO: Remove following checks when added to board helper is_node_valid_build
    if (can_build) {
        //  If this is the setup round, we can build here
      if (current_game.round_num < 3) { // TODO: MAGIC NUMBER!!!!
            success = true;
        } else {
            //  Finally, if it is a normal round, are we connected by a road?
            for (var i=0; i<node.n_roads.length; i++) {
                if (current_game.roads[node.n_roads[i]].owner == current_player.id) {
                    success = true;
                    break;
                }
            }
        }
    }

    //  If we have a node_to_ignore, restore it
    if (node_to_ignore) {
        node_to_ignore.building = temp_node.building;
        node_to_ignore.owner = temp_node.owner;
    }

    return success;
}

//  Method for updating the state of all roads on the board
//  Iterates through the most recent game data to verify roads
function buildRoads() {
    for (var i=0; i<current_game.roads.length; i++) {
        var road = current_game.roads[i];

        var road_on_canvas = $("#road_" + i);
        var road_class = getRoadCSS(road);

        if (road_on_canvas.length == 0) {
            //  First we get the top x,y point of the Tile
            var point = getRoadPosition(road);

            //  We need to know the angle (30, 90, 330)
            var angle = getRoadAngle(road);

            //  Finally create the html based on the road properties
            $("body").append("<div id='road_" + i + "' class='road " + road_class + " angle" + angle + "' style='top:" + point[1] + "px; left:" + point[0] + "px;'></div>");
        } else {
            //  The road exists on the board, update css in case it changed
            road_on_canvas.removeClass("roadspot").removeClass("locked").addClass(road_class);

            //  If a companion road exists, disable it
            var dragged_node = $("#road_" + current_player.colour + "_pending_" + road.id);
            if (dragged_node) {
                dragged_node.attr("class", "road " + current_player.colour + " disabled");
                dragged_node.attr("id", "road_" + current_player.colour + "_locked_" + road.id);
            }
        }
    }
}

//  Method to determine whether road on canvas can be
//  built on, is already built or is not available
function getRoadCSS(road) {
    var road_class = "roadspot";
    if (road.owner > -1) {
        road_class = "locked " + current_game.players[road.owner].colour;
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

//  This method determines the coordinates where a road is to be drawn
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
    var new_y = node1_top - top_diff - (0.4 * building_dimension);
    if (node1_left == node2_left) {
        //  Vertical road (90 degrees)
        new_y = (node2_top > node1_top ? node1_top : node2_top) + (0.5 * top_diff) + (0.4 * building_dimension);
    } else if (node1_top > node2_top) {
        //  30 degrees
        new_y = node2_top + top_diff + (0.4 * building_dimension);
    }

    return [new_x, new_y];
}

//  Some simple logic to see if a road can be built
function can_build_road(road, road_to_ignore, node_to_enforce) {
    var success = false;

    //  If we have a road_to_ignore, temporarily hide it's owner property
    var temp_node = new RoadNode();
    if (road_to_ignore) {
        temp_node.owner = road_to_ignore.owner;
        road_to_ignore.owner = -1;
    }

    //  Grab a local reference of the nodes array
    var nodes = current_game.nodes;
    var roads = current_game.roads;

    //  Is a road already here?
    if (road.owner == -1) {
        //  If we have a node_to_enforce, we must build off it
        var is_enforced = true;
        if (node_to_enforce) {
            if (nodes[road.connects[0]] != node_to_enforce && nodes[road.connects[1]] != node_to_enforce) {
                is_enforced = false;
            }
        }

        if (is_enforced) {
            //  Do we have an adjacent building?
            if (nodes[road.connects[0]].owner != current_player.id && nodes[road.connects[1]].owner != current_player.id) {
                //  No adjacent buildings, do we have an adjacent road? Check roads of connected nodes
                for (var h = 0; h < 2; h++) {
                    for (var i = 0; i < nodes[road.connects[h]].n_roads.length; i++) {
                        if (roads[nodes[road.connects[h]].n_roads[i]].owner == current_player.id) {
                            success = true;
                            break;
                        }
                    }
                    if (success) { break; }
                }
            } else {
                success = true;
            }
        }
    }
    //  If we have a road_to_ignore, restore it
    if (road_to_ignore) {
        road_to_ignore.owner = temp_node.owner;
    }

    return success;
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

function has_resources(object_type) {
    //  Get the current player cards
    var my_cards = new Cards();
    my_cards.resource_cards = current_game.player.cards.resource_cards;

    if (object_type == "house") {
        //  During the setup round, assume they do
        if (current_game.round_num < 3) { return true; }
        //  Otherwise we need 1 lumber, 1 grain, 1 brick and 1 sheep
        return my_cards.has_cards(['lumber', 'grain', 'brick', 'sheep']);
    }
    if (object_type == "road") {
        //  During the setup round, assume they do
        if (current_game.round_num < 3) { return true; }
        //  Otherwise we need 1 lumber, 1 brick
        return my_cards.has_cards(['lumber', 'brick']);
    }
    if (object_type == "city") {
        //  Otherwise we need 2 grain and 3 ore
        return my_cards.has_cards(['grain', 'grain', 'ore', 'ore', 'ore']);
    }
    return false;
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
        html += "                <div id='house_" + current_player.colour + "_open_" + i + "' class='house " + current_player.colour + "' ></div>";
    }
    html += "            </div>";
    html += "            <div class='citybox_disable'></div>";
    html += "            <div class='citybox'>";
    html += "                <span class='citycount'>4</span>";
    for (var i = 0; i < 4; i++) {
        html += "                <div id='city_" + current_player.colour + "_open_" + i + "' class='city " + current_player.colour + "' ></div>";
    }
    html += "            </div>";
    html += "            <div class='roadbox_disable'></div>";
    html += "            <div class='roadbox'>";
    html += "                <span class='roadcount'>15</span>";
    for (var i = 0; i < 15; i++) {
        html += "                <div id='road_" + current_player.colour + "_open_" + i + "' class='road " + current_player.colour + " angle30' ></div>";
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