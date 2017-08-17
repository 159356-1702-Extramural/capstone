/**
 * Testing the data api - data_package, action and cards
 * This test script tests the building of the object and whether data can be parsed 
 * in and out successfully
 */

var test = require('ava');

var Data_package    = require('../app/data_api/data_package.js');
var Player          = require('../app/game/player.js');
var Action          = require('../app/data_api/action.js');
var Cards           = require('../app/data_api/cards.js');

var data;
var action;
var cards;
var player;
var socket;
var mock_data;

test.beforeEach(t => {
    data    = new Data_package();
    mock_data = {name:'Craig'};
    player  = new Player(socket, mock_data);
    action  = new Action();
    cards   = new Cards();

    cards.add_card("wood");
    cards.add_card("ore");
    cards.remove_card("brick");

    action.set_action_type('build road');
    action.set_action_result(true);
    action.set_action_data([]);
    action.set_boost_cards(['wood','sheep','sheep']);

    player.id               = 0;
    player.name             = 'Craig';
    player.turn_complete    = false;
    player.score            = {total_points:0,victory_points:0,longest_road:false, largest_army:false};
    player.cards            = null;
    player.colour           = null;

    player.add_action(action);
    player.cards            = cards;

    data.set_turn_type('turn_complete');
    data.set_player(player);

});

/**
 * Objects created correctly
 */

test("Data package object can be created", function(t) {
    var data = new Data_package();
    t.truthy(data);
});

test("Player object can be created", function(t) {
    var player = new Player(socket, mock_data);
    t.truthy(player);
});

test("Action object can be created", function(t) {
    var actionObj = new Action();
    t.truthy(actionObj);
});

test("Cards object can be created", function(t) {
    var cardsObj = new Cards();
    t.truthy(cardsObj);
});

/**
 * Data_package object testing
 */

test('turn information ', function (t){
     t.is(data.turn_type, 'turn_complete');
});

test('change turn information ', function (t){
    data.set_turn_type('setup_phase');
    t.is(data.turn_type, 'setup_phase');
});

test.todo('add game_state data from Luke');

test("access player in data.player", function (t){
     t.is(data.player.actions[0].action_type, "build road");
});
 
test('Access cards from the data object' , function (t){
    t.is(data.player.actions[0].boost_cards.length, 3);
});

test('Clear data works' , function (t){
    data.clear_data();
    t.truthy(!data.turn_type && !data.player && !data.game_state);
});
/**
 * Player object testing
 */

test("Player object holds card objects" , function (t) {
    t.is(player.cards, cards);
});

test("Player object holds action objects" , function (t) {
    t.is(player.actions[0], action);
});

test("Player object clears action objects" , function (t) {
    player.clear_actions();
    t.is(player.actions.length, 0);
});


/**
 *  Action object testing
 */

test("Add boost_card to action object" , function (t) {
    action.set_boost_cards(cards);
    t.is(action.boost_cards, cards);
});

test("action_type data held correctly" , function (t) {
    action.set_action_type('Year of Plenty')
    t.is(action.action_type, 'Year of Plenty');
});

test("action_result data held correctly" , function (t) {
    action.set_action_result(false);
    t.falsy(action.action_result);
});

test("action_data held correctly" , function (t) {
    action.set_action_data(true);
    t.truthy(action.action_data);
});

test("action clear_data removes all data correctly" , function (t) {
    action.clear_data();
    t.truthy(!action.action_type && !action.action_result && (action.action_data !== []) && !action.boost_cards );
});

test("action cards accessable" , function (t) {
    t.is(player.cards.count_cards(), 2)
});


/**
 * Cards Object testing
 */



test("Correct number of cards in action", function(t) {
    t.is(cards.count_cards(), 2);
});

//test that all card types can be added 
test("Cards recorded properly" , function (t) {
    cards.add_card("sheep");
    cards.add_card("brick");
    cards.add_card("wheat");
    var result = true;
    var i = 0;
    while(i < cards.resource_cards.length){
        if(cards.resource_cards[i] !== 1){
            result = false;
        }
    }
    t.truthy(result);
});

//test that all card types can be removed 
test("Cards removed properly" , function (t) {
    cards.add_card("sheep");
    cards.add_card("brick");
    cards.add_card("wheat");
    cards.remove_card("sheep");
    cards.remove_card("brick");
    cards.remove_card("wheat");
    cards.remove_card("wood");
    cards.remove_card("ore");

    var result = true;
    var i = 0;
    while(i < cards.resource_cards.length){
        if(cards.resource_cards[i] !== 0){
            result = false;
        }
    }
    t.truthy(result);
});

test("Cards removed properly by purchase (road)", function(t) {
    cards.add_card("brick"); //now there is brick and wood
    cards.remove_cards("road");
    t.truthy(!cards.resource_cards.wood && !cards.resource_cards.brick);
});

test("Remove cards returns false when not enough cards", function(t) {
    t.falsy(cards.remove_cards('city'));
});

test("Remove cards returns true when there is enough cards", function(t) {
    cards.add_card('wheat');
    cards.add_card('brick');
    cards.add_card('sheep');
    t.truthy(cards.remove_cards('settlement'));
});

test("Check cards can't be a negative value" , function (t) {
    //take all cards to zero
    cards.remove_card("wood");
    cards.remove_card("ore");

    //now try to go to negative numbers
    cards.remove_card("sheep");
    cards.remove_card("brick");
    cards.remove_card("wheat");
    cards.remove_card("wood");
    cards.remove_card("ore");

    var result = true;
    var i = 0;
    while(i < cards.resource_cards.length){
        if(cards.cards[i] < 0){
            result = false;
        }
    }
    t.truthy(result);

});

