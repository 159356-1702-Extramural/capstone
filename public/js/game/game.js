var current_game;
function currentGame(game_data) {
    this.round_num = game_data.game_state.round_num;
    this.players = game_data.game_state.players;
    this.nodes = game_data.game_state.board.nodes;
    this.roads = game_data.game_state.board.roads;
    this.tiles = game_data.game_state.board.tiles;

    this.player = game_data.player;
}