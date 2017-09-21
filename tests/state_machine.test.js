/**
 * Unit tests for the state machine
 */
var test = require('ava');

var sm              = require('../app/game/state_machine.js');
var Data_package    = require('../app/data_api/data_package.js');
var Player          = require('../app/data_api/player.js');
var Action          = require('../public/data_api/action.js');
var Client_Data_package = require('../public/data_api/data_package.js');

var machine;

test.beforeEach(t => {
    machine = new sm.StateMachine(0);
    var mockSocket = {
        emit: function() { },
        on: function() {}
    };

    var player1 = new Player(mockSocket, {name: 'John'});
    var player2 = new Player(mockSocket, {name: 'Paul'});
    var player3 = new Player(mockSocket, {name: 'George'});
    var player4 = new Player(mockSocket, {name: 'Ringo'});

    machine.game.add_player(player1);
    machine.game.add_player(player2);
    machine.game.add_player(player3);
    machine.game.add_player(player4);


});
test("A statemachine when created also creates an empty game", function(t) {
    
    t.is(machine.id, 0);
    t.truthy(machine.game);
});

test("setSequence is set to two", function(t) {
    var sequence = machine.setSequence();
    t.is(sequence.length, 4);
});

test("Monopoly", function(t) {
    //give everyone 5 brick recource cards
    for(var i = 0; i < machine.game.players.length; i++){
        machine.game.players[i].cards.add_cards('brick',5);
    }
    var action = new Action();
    action.action_type = 'monopoly';

    action.action_data = 'brick'; //card name
    var data_package = new Client_Data_package();
    data_package.data_type = 'monopoly_used';
    data_package.player_id = 0;
    data_package.actions.push(action);
    
    //machine.activate_monopoly(data_package);
    machine.state = 'play';
    machine.tick(data_package);
    //each player has all brick removed except player 0 who receives them all
    t.is(machine.game.players[0].cards.resource_cards.brick, 20);
    t.is(machine.game.players[1].cards.resource_cards.brick, 0);
    t.is(machine.game.players[2].cards.resource_cards.brick, 0);
    t.is(machine.game.players[3].cards.resource_cards.brick, 0);
});

test('Activate_road_building', function (t) {
    // Create incoming client package
    var dev_card_deck_length = machine.development_cards.length;
    var action = new Action();
    action.action_type = 'road_building';
    action.action_data = ['lumber', 'brick', 'lumber', 'brick'];
    var data_package = new Client_Data_package();
    data_package.data_type = 'road_building_used';
    data_package.player_id = 0;
    data_package.actions.push(action);

    machine.game.players[0].cards.dev_cards.road_building = 1;

    //machine.activate_road_building(data_package);
    machine.state = 'play';
    machine.tick(data_package);

    //check resources are given
    t.is(machine.game.players[0].cards.resource_cards.brick , 2);
    t.is(machine.game.players[0].cards.resource_cards.lumber , 2);
    //check dev card removed from player hand
    t.is(machine.game.players[0].cards.dev_cards.road_building , 0);
    //check dev card returned to deck
    t.is(machine.development_cards.length, (dev_card_deck_length + 1));
});

test('Activate_year_of_plenty', function (t) {
    var dev_card_deck_length = machine.development_cards.length;
    //setup package as if it has arrived from the client
    var action = new Action();
    action.action_type = 'year_of_plenty';
    action.action_result = 0;
    action.action_data = [];

    action.action_data.push('sheep');
    action.action_data.push('grain');

    var data_package = new Client_Data_package();
    data_package.data_type = 'year_of_plenty_used';
    data_package.player_id = 0;
    data_package.actions.push(action);

    machine.state = 'play';

    machine.game.players[0].cards.dev_cards.year_of_plenty = 1;

    //machine.activate_year_of_plenty(data_package);
    machine.tick(data_package);

    //check resources are given
    t.is(machine.game.players[0].cards.resource_cards.sheep , 1);
    t.is(machine.game.players[0].cards.resource_cards.grain , 1);
    //check dev card removed from player hand
    t.is(machine.game.players[0].cards.dev_cards.year_of_plenty , 0);
    //check dev card returned to deck
    t.is(machine.development_cards.length, (dev_card_deck_length + 1));
});

test('Test buying a Development card success', function (t) {
    var dev_card_deck_length = machine.development_cards.length;
    //force first card to be year_of_plenty
    machine.development_cards[0] = 'year_of_plenty';

    //setup Player 0 with enough cards
    machine.game.players[0].cards.add_cards('grain',1);
    machine.game.players[0].cards.add_cards('ore',1);
    machine.game.players[0].cards.add_cards('sheep',1);;

    //Start with Player 0 purchasing a dev card
    //setup package as if it has arrived from the client
    var data_package = new Client_Data_package();
    data_package.data_type = 'buy_dev_card';
    data_package.player_id = 0;
    
    //machine.buy_dev_card(data_package);
    machine.state = 'play';
    machine.tick(data_package);

    //check cards are removed from hand
    t.is(machine.game.players[0].cards.resource_cards.sheep , 0);
    t.is(machine.game.players[0].cards.resource_cards.grain , 0);
    t.is(machine.game.players[0].cards.resource_cards.ore , 0);
    //check dev card added to the players hand
    t.is(machine.game.players[0].cards.dev_cards.year_of_plenty , 1);
    //check dev card removed from deck
    t.is(machine.development_cards.length, (dev_card_deck_length - 1));
});

test('Test buying a Development card failed', function (t) {
    var dev_card_deck_length = machine.development_cards.length;
    //force first card to be year_of_plenty
    machine.development_cards[0] = 'year_of_plenty';

    //setup Player 0 with insufficient cards
    machine.game.players[0].cards.add_cards('grain',1);
    machine.game.players[0].cards.add_cards('ore',1);

    //Start with Player 0 purchasing a dev card
    //setup package as if it has arrived from the client
    var data = new Client_Data_package();
    data.data_type = 'buy_dev_card';
    data.player_id = 0;

    //machine.buy_dev_card(data);
    machine.state = 'play';
    machine.tick(data);

    //check cards remain in the hand
    t.is(machine.game.players[0].cards.resource_cards.grain , 1);
    t.is(machine.game.players[0].cards.resource_cards.ore , 1);
    //check dev card not added to the players hand
    t.is(machine.game.players[0].cards.dev_cards.year_of_plenty , 0);
    //check dev card still in deck
    t.is(machine.development_cards.length, (dev_card_deck_length));
});

test('Trade 4:1 with the bank', function (t) {
    //setup cards in hand to enable trade
    machine.game.players[0].cards.add_cards('sheep', 5);
    machine.game.players[0].cards.add_cards('grain', 3);

    //Build a typical incoming data package
    var data_package = new Client_Data_package();
    data_package.data_type = 'trade_with_bank';
    data_package.player_id = 0;
    var action = new Action();

    // set action_type to trade ratio (four-to-one, three-to-one....)
    action.action_type = 'four-to-one';
    action.action_data = {
        cards_for_the_bank : 'trade_sheep',
        cards_from_the_bank: 'trade_grain',

        //set cards_for_trade to trade ratio (4,3,2)
        cards_for_trade    : 4
    }
    data_package.actions.push(action);

    //machine.trade_with_bank(data_package);
    machine.state = 'play'
    machine.tick(data_package);

    t.is(machine.game.players[0].cards.resource_cards.sheep, 1);
    t.is(machine.game.players[0].cards.resource_cards.grain, 4);
    t.is(machine.game.players[0].round_distribution_cards.resource_cards.grain, 1);
});

test('Trade 4:1 with the bank fails', function (t) {
    //setup cards in hand to enable trade
    machine.game.players[0].cards.add_cards('sheep', 5);
    machine.game.players[0].cards.add_cards('grain', 3);

    //Build a typical incoming data package
    var data_package = new Client_Data_package();
    data_package.data_type = 'trade_with_bank';
    data_package.player_id = 0;
    var action = new Action();

    // set action_type to trade ratio (four-to-one, three-to-one....)
    action.action_type = 'four-to-one';
    action.action_data = {
        cards_for_the_bank : 'trade_grain',
        cards_from_the_bank: 'trade_sheep',

        //set cards_for_trade to trade ratio (4,3,2)
        cards_for_trade    : 4
    }
    data_package.actions.push(action);

    //machine.trade_with_bank(data_package);
    machine.state = 'play'
    machine.tick(data_package);

    t.is(machine.game.players[0].cards.resource_cards.sheep, 5);
    t.is(machine.game.players[0].cards.resource_cards.grain, 3);
    t.is(machine.game.players[0].round_distribution_cards.resource_cards.sheep, 0);
});

test.todo("has_valid_path");
test.todo("wins_conflict");
test.todo("validate_player_builds");    

test('Game start sequence finishes', function (t) {
    //setupPointer set to setupSequence.length
    machine.setupPointer = machine.setupSequence.length;
    
    machine.game_start_sequence();

    t.truthy(machine.setupComplete);
    t.is(machine.setupPointer, (machine.setupSequence.length +1));
    t.falsy(machine.game.players[0].turn_complete);
    t.falsy(machine.game.players[1].turn_complete);
});

test.todo("Game start sequence ... test socket data going out???");
test.todo("send_to_player");
test.todo("broadcast")
test.todo("broadcast_end")
test.todo("broadcast_game_state")
test.todo("tick");

test.failing('Next state', function (t) {

    //need to test tick and add this to it.
    machine.state = 'setup'
    machine.next_state();
    t.is(machine.state, 'setup');

    machine.setupComplete = true;
    machine.next_state();
    t.is(machine.state, 'play');

});


