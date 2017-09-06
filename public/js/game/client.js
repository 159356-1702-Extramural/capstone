//  Our websocket
var socket = io();

//server data is the round data from the server
var server_data = [];

var building_dimension = 50;

var test1 = null;
var test2 = null;

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
        if (data.data_type === "setup_complete" ){
            setup_phase = false;
            $('.popup').hide();
            buildPopup('setup_complete');

        }else if(data.data_type === 'setup_phase'){
            if (data.player !== 0) {
                //  Popup for instructions on 1st or 2nd placement
                build_popup_setup_phase_your_turn(data.player);
            } else {
                //  Waiting for others to finish setup placement
                build_popup_waiting_for_turn();
            }

        }else if ( data.data_type === 'invalid_move'){
            //  restore player to server held player data
            current_player = data.player;

            //  revert current player state
            updatePanelDisplay();

            //  Details on failed moves
            alert("That's an invalid move  : " + data.player.actions[0].action_data);

        }else if ( data.data_type === 'wait_others'){
            //  Normal round, waiting for others
            build_popup_round_waiting_for_others();

        }else if ( data.data_type === 'monopoly_received'){
            //  Build popup to show what was won and from who
            build_popup_monopoly_win(data.player.actions);

            //  Update cards
            current_game.player = data.player;
            updatePanelDisplay();
            update_dev_cards(data);

        }else if ( data.data_type === 'round_turn' || data.data_type === 'monopoly_used'){
            if (current_game.round_num == 3) {
                //  On the first round, we need to show the setup phase results
                build_popup_setup_complete();
                setup_phase = false;
            } else {
                //  First, check to see if any previous builds failed
                var has_failed = !check_failed_builds();
                if (has_failed) {
                    //  Show the details of the failed builds
                    build_popup_failed_moves();
                    
                } else {
                    //  Otherwise, we start with the dice popup
                    build_popup_round_roll_results();
                }

                // check if monopoly played and which action id it is
                if (data.player !== null && data.player.actions !== null ) {
                    var monopoly_action_id = get_monopoly_action(data);
                    if(monopoly_action_id >= 0){
                        current_game.player = data.player;

                        build_popup_monopoly_lose(data.player.actions[monopoly_action_id]);
                        
                        //alert("you've been robbed of all your " + data.player.actions[monopoly_action_id].action_data);
                        updatePanelDisplay();
                        update_dev_cards(data);
                    }
                }
            }

        }else if ( data.data_type === 'returned_trade_card'){

            // card received from bank trade

            current_game.player = data.player;

            updatePanelDisplay();

        }else if ( data.data_type === 'buy_dev_card'){

            update_dev_cards(data);

        }else if ( data.data_type === 'successful_turn'){

            // wipe current turn data
            setupTurnFinished();
        }else{
            console.log('failed to direct data_type into an else if section');
        }
    }
    $doc.on('click', '.finishturnbutton', function(e) {
        e.preventDefault();

        var data_package = new Data_package();
        if(current_game.round_num < 3){
            if (turn_actions.length != 2) {
                alert("Please place a settlement and road.");
                return false;
            }
            data_package.data_type = "setup_phase";
        }else{
            data_package.data_type = "turn_complete";
        }

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

    $doc.on('click', '.monopoly_button', function(e) {
        e.preventDefault();

        if(this.innerHTML === 'Collect Resources'){
            var action = new Action();
            action.action_type = 'monopoly';
            action.action_result = 1;
            var temp_data = $(":first-child", ".monopoly_card").attr("class").split('_'); //action_data {String} 'trade_sheep'
            
            action.action_data = temp_data[1];
            var data_package = new Data_package();
            data_package.data_type = 'monopoly_used';
            data_package.player_id = current_player.id;
            data_package.actions.push(action);
            update_server('game_update', data_package);
            $('.popup').hide();
        //TODO Grey out dev cards?
        }else if(this.innerHTML === 'Save for Later'){
            hidePopup();
        }else{
            console.log('Monopoly button click sent wrong click information');
        }
    });

    //  Development Card -
    $doc.on('click', '.devcard_receive', function(e) {
        e.preventDefault();

        //  TODO: validate # of given resource
        var resource = $(this).attr('data-resource');
        var image = $(".devcard_receive[data-resource='" + resource + "']").html();
        $('.devcard_card').html(image);

    });

    //  Development Card - Purchase
    $doc.on('click', '.buybutton', function(e) {
        e.preventDefault();

        // TODO : only active in trade phase
        if(current_game.round_num > 2){

            // check if enough cards to buy development card
            if(has_resources('dev_card')) {

                // remove resources from hand
                current_game.player.cards.resource_cards.grain--;
                current_game.player.cards.resource_cards.ore--;
                current_game.player.cards.resource_cards.sheep--;

                //current_game.player.cards.remove_cards("dev_card");
                updatePanelDisplay();
                var data_package = new Data_package();
                data_package.data_type = "buy_dev_card";
                data_package.player_id = current_game.player.id;

                update_server('game_update',data_package);
            }
        }
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
        var resource_count = parseInt($(this).attr('data-count'));
        if (resource_count > 0) {
            var card_list = $(".extra_card_list");
            var next_z = card_list.html().length + 1;
            var new_card = '<div class="extra_card" style="z-index:' + (600 + next_z) + ';"><img src="images/card_' + resource + '_small.png"></div>';
            card_list.append(new_card);
    
            //  Remove resource and disable as needed
            resource_count --;
            $(this).attr('data-count', resource_count);
            if (resource_count < 1) { $(this).addClass("disabled"); }
        }

    });

    //  Build - Remove resources
    $doc.on('click', '.extra_card_list', function(e) {
        e.preventDefault();

        //  Clear the selected cards
        $(".extra_card_list").html("");
        //  Rebuild the list of selectable cards
        $(".select_card_list").html(getResourceCardsHtml());
        
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

// Open the trading window and make only tradable cards available
function openTrade () {

    //disable trade until setup complete
    if(current_game.round_num > 2){
        var resource_cards = current_game.player.cards.resource_cards;

        //basic card values
        var card_data = [['brick_cards',resource_cards.brick],['grain_cards',resource_cards.grain],['sheep_cards',resource_cards.sheep],['ore_cards',resource_cards.ore],['lumber_cards',resource_cards.lumber]];

        // TODO: update to variable trade values once harbours are introduced.
        var trade_value = 4;


        $.each(resource_cards, function(k, v) {
            if(v >= trade_value){
                card_data.push([k+'_status', '']);
            }else{
                card_data.push([k+'_status', 'unavailable']);
            }

        });

        buildPopup('round_maritime_trade', false, card_data);
    }
}

function acceptTrade () {

    //get id's of selected cards
    var sendCards = $('#tgb');
    var receiveCard = $('#trb');

    // make sure both cards have been set
    if(!$('#tgb').is(':empty') && !$('#trb').is(':empty')){
        var data_package = new Data_package();
        data_package.data_type = 'trade_with_bank';
        data_package.player_id = current_player.id;
        var action = new Action();

        // set action_type to trade ratio (four-to-one, three-to-one....)
        action.action_type = 'four-to-one';
        action.action_data = {
            cards_for_the_bank : $(":first-child", sendCards).attr('class'),
            cards_from_the_bank: $(":first-child", receiveCard).attr('class'),

            //set cards_for_trade to trade ratio (4,3,2)
            cards_for_trade    : 4
        }
        data_package.actions.push(action);

        update_server( 'game_update' , data_package );
        hidePopup();
    }else{
        // hide trade window
        $('.popup').hide();

        //display an error window
        alert("cant trade with that many cards");
    }
}

function tradeFailed(){

}

function invalidMove (data){

    failed_actions.forEach( function (action) {

        //  populate new array with the successful actions (and copy them into turn_actions)
        var successful_actions = [];

        if(action.action_result == 0){
            successful_actions.push(action);
        }else{
            alert("need to remove failed item artifact");
            //inform of failed actions
            //remove relevant artifact from board
            if(action.action_type === 'road'){
                //TODO: action failed dialog with 'road'
            }else if(action.action_type === 'settlement'){
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
            //only two actions allowed (build road and build settlement)
            if(turn_actions.length === 2){

                //if one is a settlement and the other is a road
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
            var point = getObjectPosition(col, row, 1);
            $(".robber").css("left", (point[0] - 15) + "px");
            $(".robber").css("top", (point[1] - 120) + "px");
            $(".robber").show();
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

                            //  If a companion settlement/city exists, disable it
                            var dragged_node = $("#" + node.building + "_" + current_player.colour + "_pending_" + node.id);
                            if (dragged_node) {
                                dragged_node.attr("class", node.building + " " + current_player.colour + " disabled");
                                dragged_node.attr("id", node.building + "_" + current_player.colour + "_locked_" + node.id);
                            }

                        }

                        //  Use the bottom node as a reference when placing the robber
                        if (j == 1 & theTile.robber) {

                        }
                    }
                }

                //  Do we need to move the robber?
                if (theTile.robber) {
                    var point = getObjectPosition(x, y, 1);
                    $(".robber").css("left", (point[0] - 15) + "px");
                    $(".robber").css("top", (point[1] - 120) + "px");
                    $(".robber").show();
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

    var cards = new Cards();
    cards.resource_cards = current_game.player.cards.resource_cards;
    if (cards.available_cards("dev_card")) {
        $(".buybutton").removeClass("disabled");
    } else {
        $(".buybutton").addClass("disabled");
    }

    if (current_game.round_num > 2) {
        $(".tradebutton").removeClass("disabled");
    }
  // Update the score
  var score = current_game.player.score;
  var $bonuses_box = $('.bonuses');

  $bonuses_box.find('.armycount').text(score.largest_army ? 1 : 0);
  $bonuses_box.find('.longroadcount').text(score.longest_road ? 1 : 0);
  $bonuses_box.find('.victorycount').text(score.total_points);

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
    var node_class = "buildspot";
    if (node.owner > -1) {
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
    var can_build_here = tempBoard.is_node_valid_build(current_player.id, node.id);

    //  TODO: Remove following checks when added to board helper is_node_valid_build
    if (can_build_here) {
        //  If this is the setup round, we can build here
      if (current_game.round_num < 3) {
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
        if (node_to_enforce != null) {
            if (nodes[road.connects[0]] != node_to_enforce && nodes[road.connects[1]] != node_to_enforce) {
                is_enforced = false;
            }
        }

        if (is_enforced && node_to_enforce != null) {
            //  Do we have an adjacent building?
            if (nodes[road.connects[0]].owner != current_player.id && nodes[road.connects[1]].owner != current_player.id) {
                //  No adjacent buildings, do we have an adjacent road? Check roads of connected nodes
                success = has_adjacent_road(road.connects[0]) || has_adjacent_road(road.connects[1]);
            } else {
                success = true;
            }
        } else if (node_to_enforce == null) {
            //  If we have a building of another player at one end, we need a road of ours at the other
            if (nodes[road.connects[0]].owner != current_player.id && nodes[road.connects[0]].owner > -1) {
                //  Check connect #0
                success = has_adjacent_road(road.connects[1]);
            } else if (nodes[road.connects[1]].owner != current_player.id && nodes[road.connects[1]].owner > -1) {
                //  Check connect #1
                success = has_adjacent_road(road.connects[0]);
            } else {
                //  No adjacent buildings, do we have an adjacent road? Check roads of connected nodes
                success = has_adjacent_road(road.connects[0]) || has_adjacent_road(road.connects[1]);
            }
        }
    }
    //  If we have a road_to_ignore, restore it
    if (road_to_ignore) {
        road_to_ignore.owner = temp_node.owner;
    }
    return success;
}
//  Helper method to check and see if one direction of a road connects is owned by current player
function has_adjacent_road(road_connect_index) {
    var nodes = current_game.nodes;
    var roads = current_game.roads;

    for (var i = 0; i < nodes[road_connect_index].n_roads.length; i++) {
        if (roads[nodes[road_connect_index].n_roads[i]].owner == current_player.id) {
            return true;
        }
    }
    return false;
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

    if (object_type == "settlement") {
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
    if (object_type == "dev_card") {
        //  Otherwise we need 2 grain and 3 ore
        return my_cards.has_cards(['ore', 'grain', 'sheep']);
    }

    return false;
}

function getResourceCardsHtml() {
    var html = "";
    var resource_list = ['ore', 'brick', 'lumber', 'grain', 'sheep'];
    for (var i = 0; i < resource_list.length; i++) {
        var resource_count = current_game.player.cards.resource_cards[resource_list[i]];
        html += "<img class='build_give trade_" + resource_list[i] + (resource_count < 1 ? " disabled" : "") + "' data-resource='" + resource_list[i] + "' data-count='" + resource_count + "' src='images/card_" + resource_list[i] + "_small.png'>";
    }
    return html;
}

function check_failed_builds() {
    for (var i = 0; i < current_game.player.turn_data.actions.length; i++) {
        if (current_game.player.turn_data.actions[i].action_type !== 'monopoly' && current_game.player.turn_data.actions[i].action_result > 0) {
            return false;
        }
    }
    return true;
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
    html += "            <div class='box trade'><div class='btn btn-info tradebutton disabled' onclick='openTrade()'>Trade</div></div>";
    html += "        </div>";
    html += "        <div class='buildings'>";
    html += "            Buildings:<br />";
    html += "            <div class='settlementbox_disable'></div>";
    html += "            <div class='settlementbox'>";
    html += "                <span class='settlementcount'>5</span>";
    for (var i = 0; i < 5; i++) {
        html += "                <div id='settlement_" + current_player.colour + "_open_" + i + "' class='settlement " + current_player.colour + "' ></div>";
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
    html += "                <div class='cardlist'><img src='../images/nocards.png' class='no_cards' /></div>";
    html += "                <div class='buy'><div class='btn btn-info buybutton disabled'>Buy Development Card</div></div>";
    html += "            </div>";
    html += "           <div class='bonuses'>";
    html += "               Bonuses:<br />";
    html += "               <div class='box bigarmy'><span class='armycount'>0</span></div>";
    html += "               <div class='box longroad'><span class='longroadcount'>0</span></div>";
    html += "               <div class='box victory'><span class='victorycount'>0</span></div>";
    html += "            </div>";

    $(".score").html(html);
}

/**
 * Show monopoly prompt if this player has monopoly card
 * 
 * TODO: make this prompt a bit nicer
 */
function checkMonopoly(){

    if(current_game.player.cards.dev_cards.monopoly > 0){
        if(confirm('Do you want to use the monopoly card?')){
            buildPopup('round_use_monopoly');
        }else{
            //send hide popups to all players
            var data_package = new Data_package();
            data_package.data_type = 'monopoly_not_used';
            data_package.player_id = this.current_game.player.id;
            update_server('game_update',data_package);
        }
    }
}

/**
 * Check though actions for monopoly
 * @return {int}                : monopoly returns action number of monopoly action
 *                           
 */
function get_monopoly_action (data) {
    var monopoly = -1;  //return action id value
    for (var i = 0; i < data.player.actions.length; i++) {
        if(data.player.actions[i].action_type === 'monopoly'){
            monopoly = i;
            return monopoly;
        }
    }
    return monopoly;
}

function update_dev_cards (data) {
    var card_list = "";
            if (data.player.cards.dev_cards.year_of_plenty > 0) {
                card_list += "<img src='images/dev_year_of_plenty.png' class='card" + (card_list.length == 0 ? " first" : "") + "'>";
            }
            if (data.player.cards.dev_cards.knight > 0) {
                card_list += "<img src='images/dev_knight.png' class='card" + (card_list.length == 0 ? " first" : "") + "'>";
            }
            if (data.player.cards.dev_cards.monopoly > 0) {
                card_list += "<img src='images/dev_monopoly.png' class='card" + (card_list.length == 0 ? " first" : "") + "'>";
            }
            if (data.player.cards.dev_cards.road_building > 0) {
                card_list += "<img src='images/dev_road_building.png' class='card" + (card_list.length == 0 ? " first" : "") + "'>";
            }
            $(".cardlist").html(card_list);
}
function doLog(m) {
    $(".log").append(m + "<br />");
}