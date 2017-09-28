var current_player;

function currentPlayer(name, id, colour) {
  this.name = name;
  this.id = id;
  this.colour = colour;
  this.points = 0;
  this.road_building_used = false;
  this.free_roads = 0;
  this.dev_cards = {
    played: false,
    purchased: 0
  };
  this.trading = {
    sheep: false,
    ore: false,
    lumber: false,
    brick: false,
    grain: false,
    three: false
  };
}