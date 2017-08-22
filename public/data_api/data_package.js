
/**
 * Data Api to transmit game data back to server
 */

function Data_package(){
    
    //turn type is used to determine how data is passed see wiki for options
    this.data_type  = '';

    this.player_id    = null;

    //fill actions with action objects
    this.actions = [];
};

Data_package.prototype.set_data_type = function (turnType){
    this.data_type = turnType;
};

Data_package.prototype.set_player_id = function (playerId){
    this.player_id = playerId;
};

Data_package.prototype.add_action = function (action){
    this.actions.push(action);
};

Data_package.prototype.clear_data = function (){
    this.data_type  = '';
    this.actions    = [];
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Data_package;
}


