//  Our websocket
var socket = io();

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

    socket.on('update_game', function (data) {
        
    });
        
    //  Create local player after join
    socket.on('player_id', function (data) {
        current_player = new currentPlayer(data.name, data.id, data.colour);
        setupPlayer();
        buildPopup("waiting_for_players", false);
    });

    // Uodate the waiting display as new players join the game
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
        var boardObject = JSON.parse(data);

        //  Build tiles
        var _html = "";
        for (var i=0; i< boardObject.tiles.length; i++) {
            var row = boardObject.tiles[i];
            for (var j=0; j<row.length; j++) {
                _html += buildTile(row[j], i, j);
            }
        }
        $(".board").html(_html);

        //  Add ghost images (nodes)
        for (var i=0; i< boardObject.tiles.length; i++) {
            var row = boardObject.tiles[i];
            for (var j=0; j<row.length; j++) {
                //  For each tile, find all nodes

                if (theNode.tileID == theTile.id) {
                    newTile += "<div id='" + theNode.tileID + "." + theNode.id + "' class='node node" + theNode.id + " " + theNode.type + "'></div>";
                }
            }
        }

    });

    //  During the setup phase, each player waits until their 
    //  turn, while the active player places a settlement and road
    var playerSetup = function (data){
        if (data[1]) {
            buildPopup("setup_phase_your_turn", false);
        } else {
            buildPopup("waiting_for_turn", false);
        }
    }



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
function buildNodes() {

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
    html += "                   <div class='btn btn-info finishturnbutton' onclick='finishTurn();'>Finish Turn</div>";
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
