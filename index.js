'use strict';

var phantom = require('./lib/phantom'),
	io = require('socket.io')(3500);

io.on('connect', socket => {
	console.log('Socket.io on Phantom is connected!');
	socket.on('spider', url => phantom.init(socket, url));
});

io.on('disconnect', () => {
	console.log('Socket.io on Phantom is disconnected!');
});
