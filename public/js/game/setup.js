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
            // TODO: Get the game started!
            alert('Let the game begin!');
        });
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