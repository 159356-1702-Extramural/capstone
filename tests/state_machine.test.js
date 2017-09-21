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
    machine.activate_monopoly(data_package);

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
    data_package.data_type = 'road_building';
    data_package.player_id = 0;
    data_package.actions.push(action);

    machine.game.players[0].cards.dev_cards.road_building = 1;

    machine.activate_road_building(data_package);

    //check resources are given
    t.is(machine.game.players[0].cards.resource_cards.brick , 2);
    t.is(machine.game.players[0].cards.resource_cards.lumber , 2);
    //check dev card removed from player hand
    t.is(machine.game.players[0].cards.dev_cards.road_building , 0);
    //check dev card returned to deck
    t.is(machine.development_cards.length, (dev_card_deck_length + 1));
});
test.todo("trade_with_bank function");

