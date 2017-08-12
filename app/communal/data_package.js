
/**
 * Data Api to transmit game data back and forward
 */

function Data_package(){
    
    //turn type is used to determine how data is passed see wiki for options
    this.turn_type  = '';
    this.board_data = null,
           //actions is an array of object Action (below)
    this.actions    = [];
}

Data_package.prototype.set_turn_type = function (turnType){
    this.turn_type = turnType;
}

Data_package.prototype.add_actions = function (action){
    this.actions.push(action);
}

Data_package.prototype.add_board_data = function (boardData){
    this.board_data = boardData;
}

module.exports = Data_package;

