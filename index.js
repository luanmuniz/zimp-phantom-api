'use strict';

var configFile = require('./config/config.json'),
	NODE_ENV = process.env.NODE_ENV || 'development',
	config = configFile[NODE_ENV],
	logentries = require('logentries'),
	phantom = require('./lib/phantom'),
	io = require('socket.io')(config.port);

io.on('connect', socket => {
	console.log('Socket.io on Phantom is connected!');
	socket.on('spider', url => phantom.init(socket, url));
});

io.on('disconnect', () => {
	console.log('Socket.io on Phantom is disconnected!');
});
