//  Our websocket
var socket = io();

$(document).ready(function() {

  var $doc = $(document);

  var boardObject = {};
  var nodesObject = {};
  
    // Start menu section links
    $doc.on('click', '.js-start-toggle', function(e) {
        e.preventDefault();
        var active_class = $(this).attr('data-target');
        display_start_modal(active_class);
    });

    //hide wait for settlement placement window
    $doc.on('click', '#placeSettlement', function(){
        $('.start').fadeOut(400, function() {
            
        });
    } )

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
        
        display_start_modal('waiting');

    });

    // Uodate the waiting display as new players join the game
    socket.on('player_joined', function (data) {
        $('.start .waiting_text')
            .find('.count').text(data.player_count)
            .end()
            .find('.total').text(data.max_players);
    });

    // Detect the game starting
    socket.on('game_start', function (data) {
        $('.start').fadeOut(400, function() {

        });
    });

    // Detect the game starting
    socket.on('build_board', function (data) {
        var temp = JSON.parse(data);

        boardObject = temp.board;
        nodesObject = temp.nodes;

        drawBoard(boardObject, nodesObject);
        setupPlayer();
        setupDragDrop(boardObject, nodesObject);
    });

    // Update game state
    socket.on('updateGameState', function (data) {
        if(data.updateType === 'playerSetup'){
           playerSetup(data);
        }
    })

    /**
     * Displays a subsection of the start modal
     * 
     * @param {string} active_class : subsection class that you want to display in the start modal
     */
    function display_start_modal(active_class) {
        $('.start .start_subsection').each(function () {
            var $section = $(this);
            $section.toggleClass('hide', !$section.hasClass(active_class));
        });
    }

});
var playerSetup = function (data){
    //data.gameData is true if player takes turn to place settlement
    
    $('start_subsection').addClass('hide');
    $('waiting_for_turn').removeClass('hide');
    $('.placeButton').addClass('hide');
    if( $('.start:hidden').length){
        $('.start').fadeIn(400, function(){});
    }
    if(data.gameData){
        $('.placeButton').removeClass('hide');
    } 
    
}

function drawBoard(board, nodes) {
    tilePosition = 0;
    numberPosition = 0;

    var row = 0;
    var col = 0;
    var newBoard = "";

    for (var i=0; i<7; i++) {
        var theRow = board[i];
        newBoard += "<div class='row" + (newBoard.length == 0 ? " top" : "") + "'>";
        for (var j=0; j<theRow.length; j++) {
            var theTile = theRow[j];
            newBoard += buildTile(nodes, theTile, row, col);
            col++;
        }
        newBoard += "</div>";
        col = 0;
        row++;
    }

    $(".board").html(newBoard);
}
function buildTile(nodes, theTile, row, col) {
    if ((row % 2) == 0 && col == 6) {
        return "";
    } else {
        var newTile = "<div class='hex";

        if (theTile.type == "water" || theTile.type == "harbor") {
            newTile += "_" + theTile.type;
            if (theTile.type == "harbor") {
                newTile += " " + theTile.harborAlign;
            }
        } else {
            newTile += " " + theTile.type;
        }

        newTile += ((row % 2) != 0 && (col == 0 || col == 6) ? " half" : "") + "'>";
        if (theTile.type == "desert") {
            newTile += "<div class='robber'></div>";
        }
        if (theTile.type == "harbor") {
            newTile += "<img src='images/ship_" + theTile.harbor + ".png' class='ship' />";
        }

        //  Set node placeholders
        if (theTile.type != "water" && theTile.type != "harbor") {
            for (var i=0; i<nodes.length; i++) {
                //  We only want nodes tied to this tile
                var theNode = nodes[i];
                if (theNode.tileID == theTile.id) {
                    newTile += "<div id='" + theNode.tileID + "." + theNode.id + "' class='node node" + theNode.id + " " + theNode.type + "'></div>";
                }
            }
        }

        //  Set the number token if this tile has one
        if (theTile.type != "water" && theTile.type != "harbor" && theTile.type != "desert") {
            newTile += "<div class='token'><div class='number'>" + theTile.token + "<div class='dots'>" + getDots(theTile.token) + "</div></div></div>";
        }

        newTile += "</div>";

        return newTile;
    }
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
    html += "            <div class='player'><img src='images/Player1.png' /></div>";
    html += "            <div class='playername'>Player Name";
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
