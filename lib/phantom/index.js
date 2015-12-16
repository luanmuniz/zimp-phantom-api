'use strict';

var spawn = require('child_process').spawn,
	path = require('path'),

Phantom = {
	init(socket, url) {
		return Phantom.checkIfPhantomJSIsInstalled()
			.then(() => Phantom.isInstalled(socket, url))
		;
	},

	checkIfPhantomJSIsInstalled() {
		return new Promise((resolve, reject) => {
			let phantomjs = spawn('phantomjs', ['-v']);
			phantomjs.stdout.on('data', data => Phantom.success(socket, data));
			phantomjs.stderr.on('data', err => Phantom.error(socket, err));
			phantomjs.on('error', err => Phantom.error(socket, err));
		});
	},

	isInstalled(socket, url) {
		let filePath = ['.', 'lib', 'crawler', 'lib', 'phantom', 'phantom.js'],
			filePathResolved = path.resolve.apply(path, filePath),
			phantom = spawn('phantomjs', [filePathResolved, url]);

		phantom.stdout.on('data', data => Phantom.success(socket, data));
		phantom.stderr.on('data', err => Phantom.error(socket, err));
		phantom.on('error', err => Phantom.error(socket, err));
	},

	success(socket, data) {
		socket.on('phantom', data);
	},

	error(socket, err) {
		socket.on('phantom-error', err);
	}
};

module.exports = Object.create(Phantom);
