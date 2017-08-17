/**
 * Testing the data api - data_package, action and cards
 * This test script tests the building of the object and whether data can be parsed 
 * in and out successfully
 */

var test = require('ava');

var Data_package = require('../public/data_api/data_package.js');
var Action = require('../public/data_api/action.js');

var boost_cards;
var data;
var action;
var action2;
var start_node;
var end_node;
var cards;

test.beforeEach(t => {
    data = new Data_package();
    action = new Action();
    action2 = new Action();
    start_node = 3;
    end_node = 5;

    cards = ['wood', 'sheep', 'ore'];
    action.set_action_type('build road');
    action.set_action_data([start_node, end_node]);
    action.set_boost_cards(cards);

    action2.set_action_type('buy development card');
    action2.set_action_data();
    action2.set_boost_cards(['brick', 'brick', 'brick']);

    data.set_data_type('turn_complete');
    data.set_player_id(0);
    data.add_action(action);
    data.add_action(action2);
});

/**
 * Objects created correctly
 */


test("Data package object can be created", function(t) {
    var data = new Data_package();
    t.truthy(data);
});

test("Action object can be created", function(t) {
    var action = new Action();
    t.truthy(action);
});

/**
 * Data_package object testing
 */

test('turn information ', function (t){
     t.is(data.data_type, 'turn_complete');
});

test('change turn information ', function (t){
    data.set_data_type('setup_phase');
    t.is(data.data_type, 'setup_phase');
});

test("access actions in data.actions", function (t){
     t.is(data.actions[0].action_type, "build road");
});
 
test("change data in data.actions", function (t){
    data.actions[0].set_action_type("build_city"); 
    t.is(data.actions[0].action_type, "build_city");
});

test("add action to data", function (t){
    data.add_action(action);
    t.is(data.actions.length, 3);
});

test('Access cards from the data object' , function (t){
    t.is(data.actions[0].boost_cards.length, 3);
});
/**
 * Action object testing
 */

test("Action object holds boost_card objects" , function (t) {
    t.is(action.boost_cards, cards);
});

test("Add boost_card to action object" , function (t) {
    var card_array = ['ore', 'ore', 'ore'];
    action2.set_boost_cards(card_array);
    t.is(action2.boost_cards, card_array);
});

test("action_type data held correctly" , function (t) {
    action.set_action_type('Year of Plenty')
    t.is(action.action_type, 'Year of Plenty');
});

test("action_data data held correctly" , function (t) {
    t.is(action.action_data[0], start_node);
});

test("action_data data held correctly - accessing second array value" , function (t) {
    t.is(action.action_data[1], end_node);
});

test("Clear data works correctly" , function (t) {
    action.clear_data();
    t.truthy(!action.action_type && !boost_cards && !(action.action_data === []));
});


