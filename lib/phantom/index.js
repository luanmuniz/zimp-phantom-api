'use strict';

var spawn = require('child_process').spawn,
	path = require('path'),

Phantom = {
	init(socket, url) {
		url = url[0] || url;
		return Phantom.checkIfPhantomJSIsInstalled()
			.then(() => Phantom.isInstalled(socket, url))
		;
	},

	checkIfPhantomJSIsInstalled() {
		return new Promise((resolve, reject) => {
			let phantomjs = spawn('phantomjs', [ '-v' ]);
			phantomjs.stdout.on('data', data => resolve(data));
			phantomjs.stderr.on('data', err => reject(err));
			phantomjs.on('error', err => reject(err));
		});
	},

	isInstalled(socket, url) {
		let filePath = [ '.', 'lib', 'phantom', 'phantom.js' ],
			filePathResolved = path.resolve.apply(path, filePath),
			phantom = spawn('phantomjs', [ filePathResolved, url ]),
			phantomData = '';

		phantom.stdout.on('data', data => phantomData += data.toString());
		phantom.on('close', done => Phantom.success(socket, phantomData));
		phantom.stderr.on('data', err => Phantom.error(socket, err));
		phantom.on('error', err => Phantom.error(socket, err));
	},

	success(socket, data) {
		socket.emit('phantom', data);
	},

	error(socket, err) {
		socket.emit('phantom-error', err);
	}
};

module.exports = Object.create(Phantom);
