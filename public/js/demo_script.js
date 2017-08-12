// Shortcut to $(document)
var $doc = $(document);

//  Our websocket
var socket = io();


// Simple objects to make demo work, we'll need something
// more sophisticated and not globals
var this_player  = {
    id : null
};
var players = {};

// General error handling for now...
socket.on('game_error', function (data) {
    display_section('error');
    alert(data.message);
});

//
// SOCKET LISTENERS
//

// Know thyself...
socket.on('player_id', function(data) {
    this_player.id = data.id
});

// Player has joined
socket.on('player_joined', function (data) {
    $('.display_section[data-section-name=waiting_for_game]')
        .find('.count').text(data.player_count)
            .end()
        .find('.total').text(data.max_players);
});

// Game starting!
socket.on('game_start', function (data) {
    display_section('gameplay');
});

// Game update
socket.on('update_game', function(data) {
    if(data === "playersWait"){
        //show the players wait dialogue
    }else if(data === "playerSetup"){
        //inform player they can place a settlement and road 
    }else{
        display_game(data);
    }
});

//
// DOCUMENT LISTENERS
//

// Debugging reset button,resets the  game and reloads the page
$doc.on('click', '.reset_game', function(e) {
    e.preventDefault();
    socket.emit('reset_game');
    window.location.reload();
});


// Join the game request
$doc.on('submit', '#join_game_form', function (e) {
    e.preventDefault();
    socket.emit('join_request', {
        name: $('#join_name').val()
    });
    display_section('waiting_for_game');
});

// Take a turn
$doc.on('click', '.take_turn', function(e) {
    e.preventDefault();
    socket.emit('game_update', {
        player_id: this_player.id
    });
});

//
// FUNCTIONS
// 

// Determines what part of the page we are showing
function display_section(section_name) {
    $('div.display_section')
        .each(function () {
            $(this).toggle($(this).attr('data-section-name') == section_name);
        });
}

// Displays the Game
function display_game(game_data) {

console.log('game_data: ', game_data);

    $('#round_num').text(game_data.round_num);

    $('#game_elements').empty();
    game_data.players.forEach(function(player, idx) {
        if (player.turn_complete) {
                $('#game_elements').append(
                    $('<p>'+ player.name +' is ready</p>').css('color', 'green')
                );
        } else {
            if (idx == this_player.id) {
                $('#game_elements').append(
                    $('<button class="take_turn">').text('Take Turn')
                );
            } else {
                $('#game_elements').append(
                    $('<p>Waiting for ' + player.name + ' to take turn</p>').css('color', 'red')
                );
            }
        }
    });
}

 