
function Game_state() {

    //players data = [{player_id:1, name: 'Craig', color: '#000'}, {...}]
    this.players_data   = [];

    //this holds all the data used to generate the board
    this.board_setup    = null;

    this.round_num      = 1;

}

module.exports = Game_state;
