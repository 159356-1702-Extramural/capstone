var logger = require('winston');

/**
 *  Module to Handle in game chat, receive messages from
 *  players and boardcast those to other players in the group
 *  @param {Array} players - player objects
 */
function Chat(players) {

  this.players = null;

  this.initialise_chat(players);
}


/**
 * Sets up the listeners for this chat group
 * @param {Array} players - player objects
 */
Chat.prototype.initialise_chat = function(players) {

  logger.log("info", 'Chat initialised for new game.');

  this.players = players;

  var _self = this;

  for (var i = 0; i < players.length; i++) {
    players[i].socket.on('chat_message', function(data) {
      _self.broadcast(data.player_id, data.message);
    });
  }
};

/**
 * Sends chat message to all players
 * @param {String} message
 * @param {Number} player_id
 */
Chat.prototype.broadcast = function(player_id, message) {

  var players = this.players;
  var name = this.players[player_id].name;

  message = this.encodeTags(message);

  logger.log("info", 'Dispatching chat message from: ' + name);

  for (var i = 0; i < players.length; i++) {
    players[i].socket.emit('chat_message', {
      name: name,
      player_id: player_id,
      message: message
    });
  }

};

/**
 * Encode any tags in the message
 * @param {String} string - suspect text string
 */
Chat.prototype.encodeTags = function (string) {

  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  string = string.replace(/[&<>"']/g, function (m) {
    return map[m];
  });

  return string;
};

module.exports = Chat;