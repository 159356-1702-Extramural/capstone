
/**
 * Action object describes a specific action for a player or
 *     a specific result from the server 
 */

function Action(){
    /**
     * Action types
     *   build_settlement
     *   build_road
     *   build_city
     *   year_of_plenty
     *   monopoly
     *   soldier_knight
     *   road_building
     *   new turn
     */
    this.action_type    = '';

    //action_result set to true if player action succeeds 
    this.action_result  = false;

    //action_data will vary based on action_type
    this.action_data    = [];

    //message to display to user regarding this action
    this.action_message = '';

    //cards to be used in normal turn phase
    this.cards          = null;
    
    //boost cards kept seperate so easy to count and to return
    this.boost_cards    = null;
}

Action.prototype.set_action = function(returned_action_type){
    this.action_type = returned_action_type;
}

Action.prototype.set_action_result = function (result){
    this.action_result = result;
}

Action.prototype.set_action_message = function (message){
    this.action_message = message;
}

Action.prototype.set_cards = function (cards){
    this.cards = cards;
}

Action.prototype.set_boost_cards = function (cards){
    this.boost_cards = cards;
}

// TODO: Move action object inside data_package, 'action function' only required when Data_package is created
module.exports = Action;
