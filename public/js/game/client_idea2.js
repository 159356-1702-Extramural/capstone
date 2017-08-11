//  Our websocket
var socket = io();

$(document).ready(function() {

  var $doc = $(document);
    
    // Start menu section links
    $doc.on('click', '.js-start-toggle', function(e) {
        e.preventDefault();
        var active_class = $(this).attr('data-target');
        display_start_modal(active_class);
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

function TileNode(type, robber, token) {
    this.type = type;
    this.robber = robber;
    this.token = token;
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
