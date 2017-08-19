/**
 * Testing the data api - data_package, action and cards
 * This test script tests the building of the object and whether data can be parsed 
 * in and out successfully
 */

var test = require('ava');

var Data_package = require('../app/data_api/data_package.js');
var Action = require('../public/data_api/action.js');
var Cards = require('../app/data_api/cards.js');

var cards; 
var boost_cards;
var action;
var action2;
var data;
var startNode;
var endNode;

test.beforeEach(t => {
    data = new Data_package();
    action = new Action();
    action2 = new Action();
    cards = new Cards();
    boost_cards = new Cards();

    cards.add_card("wood");
    cards.add_card("ore");
    cards.remove_card("brick");

    boost_cards.add_card("sheep");
    boost_cards.add_card("brick");
    boost_cards.add_card("wheat");

    //for a road and a settlement
    startNode = 3;
    endNode = 6;

    action.action_type      = "build_settlement";
    action.action_result    = true;
    action.action_data      = [startNode];
    action.action_message   = 'Settlement build complete';
    action.cards            = cards;
    action.boost_cards      = boost_cards;

    action2.action_type      = "build_road";
    action2.action_result    = false;
    action2.action_data      = [startNode, endNode];
    action2.action_message   = 'Road building failed';
    action2.cards            = boost_cards;
    action2.boost_cards      = cards;

    data.turn_type  = 'turn_complete';
    data.board_data = null,
    data.actions    = [action, action2];

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
     t.is(data.actions[0].action_type, "build_settlement");
});

test('Access cards from the data object' , function (t){
    t.is(data.actions[0].boost_cards.count_cards(), 3);
});
/**
 * Action object testing
 */

test("Action object holds card objects" , function (t) {
    t.is(action.cards, cards);
});

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

test("action cards accessable" , function (t) {
    t.is(action.cards.count_cards(), 2)
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
        if(cards.resource_cards[i] < 0){
            result = false;
        }
    }
    t.truthy(result);

});


//case "place Settlement during game start"
//check settlement placement valid
//check road placement valid
//add settlement to player
//add road to player
//  case Year of Plenty   -> [UniqueActionId, 1 , cardNum]
//loop twice over "add card to player hand function(random / cardName)" (server side)
//  case Play Soldier / Knight -> [UniqueActionId, 2 , [playerID, hexID],cardsToBoost]
// check whether any other players playing knight
// highest boost wins
// if it's a draw randomise winner (no one will know its a random winner and game moves forward and using soldiers)
//  case Monopoly   -> [UniqueActionId, 3 , cardNum]
// take all cards of type{type} from all players and add it to current players hand
// send revised gameboard and player data
//  case Build 2 roads  -> [UniqueActionId, 4 , [startNode, endNode], cardsToBoost]
// loop Build a road twice
//  case Build a road   -> [UniqueActionId, 5 , [startNode, endNode], cardsTOBoost]
// Check valid road building choices against current gamedata
// Check multiple build requests on a node
    // Build 2 roads card wins
    // Resolve with boosts
    // randomise win for ties???
//  case Build a settlement> [UniqueActionId, 6 , nodeNum, cardsToBoost]
//Check valid building node against game board
// Check multiple build requests from all players on  node OR ADJACENT NODES
    // Boosts to resolve
    // Randomise win to ties???
//  case Build a city   -> [UniqueActionId, 7 , nodeNum] (must already exist in settlementarray)
//Check that city is being build on a settlement of the current player
//  case Play robber  -> [UniqueActionId, 8 , [playerID, hexID], cardsToBoost] - DELME
//Dealt with directly after diceroll
//  case Trade  -> [UniqueActionId, 9 , [card requested, card Offered]]
//Swap cards for both players 

//Build data structure to send to all players