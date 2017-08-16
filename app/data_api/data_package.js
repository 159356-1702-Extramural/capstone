
/**
 * Data Api to transmit game data back and forward
 */

function Data_package(){
    
    //turn type is used to determine how data is passed see wiki for options
    this.turn_type  = '';

    //populate by copying player object from game.players
    this.player     = null;
    this.game_state = null;
}

Data_package.prototype.set_turn_type = function (turnType){
    this.turn_type = turnType;
}

Data_package.prototype.add_player = function (player){
    this.actions.push(player);
}

Data_package.prototype.add_game_state = function (gameState){
    this.game_state = gameState;
}

Data_package.prototype.clear_data = function (gameState){
    this.game_state = gameState;
    this.turn_type  = '';
    this.player     = null;
    this.game_state = null;
}

module.exports = Data_package;

