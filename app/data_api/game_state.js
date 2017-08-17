
function Game_state(){

    //players data = [{player_id:1, name: 'Craig', color: '#000'}, {...}]
    this.players_data   = [];

    //this holds all the data used to generate the board
    this.board_setup    = null;

    //node data to render roads for all players on the board
    this.road_nodes    = [];
    
    //node data to render settlements for all players on the board
    this.settlement_nodes    = [];

    //node data to render cities for all players on the board
    this.city_nodes    = [];

}

module.exports = Game_state;
