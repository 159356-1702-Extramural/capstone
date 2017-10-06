var io = require('socket.io-client');
var socketClient = io.connect('http://localhost:3000'); // Specify port if your express server is not using default port 80

socketClient.on('connect', () => {
  socketClient.emit('npmStop');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});
