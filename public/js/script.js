var socket = io();

socket.on('connection', function() {
    console.log('Socket connected.');
});