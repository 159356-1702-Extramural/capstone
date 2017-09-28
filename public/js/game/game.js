var current_game;

function currentGame(game_data) {
  this.round_num = game_data.game_state.round_num;
  this.players = game_data.game_state.players;
  this.nodes = game_data.game_state.board.nodes;
  this.roads = game_data.game_state.board.roads;
  this.tiles = game_data.game_state.board.tiles;
  this.dice_values = game_data.game_state.dice_values;
  this.player = game_data.player;
  this.knight_player_id = game_data.game_state.knight_player_id;
  this.knight_in_use = false;
}