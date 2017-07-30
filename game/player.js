/**
 * Instance of a player
 * 
 * @param {any} socket 
 * @param {any} data 
 */
function Player(socket, data) {
    this.name           = data.name;
    this.socket         = socket;
    this.turn_complete  = false;
}

module.exports = Player;