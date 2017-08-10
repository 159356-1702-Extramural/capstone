//  Our websocket
var socket = io();

$(document).ready(function() {

    var $doc = $(document);
    
    // Start Menu section toggler
    $doc.on('click', '.js-start-toggle', function(e) {
        e.preventDefault();
        var active_class = $(this).attr('data-target');

        $('.start .start_subsection').each(function() {
            var $section = $(this);
            $section.toggleClass('hide', !$section.hasClass(active_class));
        });
    });

    // Join a Game
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
        
        // TODO: display spinner and message "Waiting for more players to join..."

    });

    // TODO: detect when game is full and close the waiting spinner

});