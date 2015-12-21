'use strict';

var spawn = require('child_process').spawn,
	path = require('path'),

Phantom = {
	init(socket, urls) {
		urls = Array.isArray(urls) ? urls : [urls];
		return Phantom.checkIfPhantomJSIsInstalled()
			.then(() => Phantom.isInstalled(socket, urls))
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

	isInstalled(socket, urls) {
		urls.forEach(url => {
			Phantom.getResponse(socket, url);
		});
	},

	getResponse(socket, urls) {
		let phantomPath = [ '.', 'lib', 'phantom', 'phantom.js' ],
			phantomPathResolved = path.resolve.apply(path, phantomPath),
			phantom = spawn('phantomjs', [ phantomPathResolved, urls ]),
			phantomData = [],
			phantomError = [];

		phantom.stdout.on('data', data => phantomData.push(data));
		phantom.stderr.on('data', err => phantomError.push(err));

		phantom.on('error', err => {
			var errorStr = new Buffer(JSON.stringify({ error: err }));
			phantomError.push(errorStr);
		});

		phantom.on('close', done => {
			if(phantomError[0]) {
				return Phantom.error(socket, Buffer.concat(phantomError));
			}
			Phantom.success(socket, Buffer.concat(phantomData));
		});
	},

	success(socket, data) {
		socket.emit('phantom', data);
	},

	error(socket, err) {
		socket.emit('phantom-error', err);
	}
};

module.exports = Object.create(Phantom);
