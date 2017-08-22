/**
 * Testing the data api - data_package, action and cards
 * This test script tests the building of the object and whether data can be parsed
 * in and out successfully
 */

var test = require('ava');

var Data_package = require('../app/data_api/data_package.js');
var Player = require('../app/data_api/player.js');
var Action = require('../public/data_api/action.js');
var Cards = require('../app/data_api/cards.js');

var cards;
var boost_cards;
var actions;
var action;
var action2;
var data;
var startNode;
var endNode;
var player;

test.beforeEach(t => {
    data = new Data_package();
    actions = [];
    action = new Action();
    action2 = new Action();
    cards = new Cards();
    boost_cards = new Cards();
    player = new Player({}, 0);

    cards.add_card("lumber");
    cards.add_card("ore");
    cards.remove_card("brick");

    boost_cards.add_card("sheep");
    boost_cards.add_card("brick");
    boost_cards.add_card("grain");

    //for a road and a settlement
    startNode = 3;
    endNode = 6;

    action.action_type      = "build_settlement";
    action.action_result    = true;
    action.action_data      = [startNode];
    action.action_message   = 'Settlement build complete';
    action.boost_cards      = boost_cards;

    action2.action_type      = "build_road";
    action2.action_result    = false;
    action2.action_data      = [startNode, endNode];
    action2.action_message   = 'Road building failed';
    action2.boost_cards      = cards;

    actions.push(action);
    actions.push(action2);

    player.actions          = actions;

    data.turn_type  = 'turn_complete';
    data.game_state = null,
    data.player     = player;

});

/**
 * Objects created correctly
 */


test("Data package object can be created", function(t) {
    var data = new Data_package();
    t.truthy(data);
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

test.todo('add board data from Luke');

test("access actions in data.actions", function (t){
     t.is(data.player.actions[0].action_type, "build_settlement");
});

test('Access cards from the data object' , function (t){
    t.is(data.player.actions[0].boost_cards.count_cards(), 3);
});

test('Clear data_pakage data' , function (t){
    data.clear_data();
    t.is(data.turn_type , '');
    t.is(data.player , null);
    t.is(data.game_state , null);

});
/**
 * Action object testing
 */

test("Action object holds boost_card objects" , function (t) {
    t.is(action2.boost_cards, cards);
});

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

test("action_data data held correctly" , function (t) {
    t.is(action2.action_data[0], startNode);
});

test("action_data data held correctly - accessing second array value" , function (t) {
    t.is(action2.action_data[1], endNode);
});

test("clear action data" , function (t) {
    action.clear_data();
    t.is(action.action_type, '');
    t.is(action.action_result, false);
    t.is(action.action_data.length, 0);
    t.is(action.boost_cards, null);
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
    cards.add_card("grain");
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
    cards.add_card("grain");
    cards.remove_card("sheep");
    cards.remove_card("brick");
    cards.remove_card("grain");
    cards.remove_card("lumber");
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

test("Check cards can't be a negative value" , function (t) {
    //take all cards to zero
    cards.remove_card("lumber");
    cards.remove_card("ore");

    //now try to go to negative numbers
    cards.remove_card("sheep");
    cards.remove_card("brick");
    cards.remove_card("grain");
    cards.remove_card("lumber");
    cards.remove_card("ore");

    var result = true;
    var i = 0;
    while(i < cards.resource_cards.length){
        if(cards.resource_cards[i] < 0){
            result = false;
        }
    }
    t.truthy(result);

});

test("Remove purchases from Card object" , function (t) {
    cards.add_card("brick"); //now there should be ore, brick and lumber
    cards.remove_cards("road");
    t.is(cards.count_cards(), 1);

    cards.add_card("grain");
    cards.add_card("sheep"); //now there should be ore, grain and sheep
    cards.remove_cards("dev_card");
    t.is(cards.count_cards(), 0);

    cards.add_card("brick");
    cards.add_card("lumber");
    cards.add_card("grain");
    cards.add_card("sheep"); //now there should be brick, lumber, grain and sheep
    cards.remove_cards("settlement");
    t.is(cards.count_cards(), 0);

    cards.add_card("ore");
    cards.add_card("ore");
    cards.add_card("ore");
    cards.add_card("grain");
    cards.add_card("grain"); //now there should be 33 ore and 2 grain
    cards.remove_cards("city");
    t.is(cards.count_cards(), 0);
});

/**
 * public/data_api tests
 */

