
/**
 * Data Api to transmit game data back and forward
 */

function Data_api(){
    
    //turn type is used to determine how data is passed
    this.turn_type  = '';
    this.turn_data  = {
        board_data: null,

        //actions is an array of object Action (below)
        actions: []
    }
}

/**
 * Action object describes a specific action for a player or
 *     a specific result from the server 
 */

function Action(){
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

/**
 * Create a cards object to hold relevant card relating to specific action
 */
function Cards(){
    this.brick  = 0;
    this.wheat  = 0;
    this.sheep  = 0;
    this.wood   = 0;
    this.ore    = 0;
}
