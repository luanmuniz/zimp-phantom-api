'use strict';

var http = require('http'),
	express = require('express'),
	app = express(),
	port = process.env.PORT || 5000,
	server = http.createServer(app),
	io = require('socket.io')(server),
	phantom = require('./lib/phantom');

server.listen(port);

io.on('connect', socket => {
	console.log('Socket.io on Phantom is connected!');
	socket.on('spider', url => phantom.init(socket, url));
});

io.on('disconnect', () => {
	console.log('Socket.io on Phantom is disconnected!');
});
