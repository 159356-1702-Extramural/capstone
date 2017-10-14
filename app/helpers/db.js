var mysql = require('mysql');
var connection;

module.exports = {
  getConnection: function () {
    if (connection) return connection;
    connection = mysql.createConnection(process.env.JAWSDB_URL);
    return connection;
  }
};