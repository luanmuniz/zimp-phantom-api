'use strict';

var spawn = require('child_process').spawn,
	path = require('path'),

Phantom = {
	init(socket, urls, options) {
		urls = Array.isArray(urls) ? urls : [ urls ];
		return Phantom.checkIfPhantomJSIsInstalled()
			.then(() => Phantom.isInstalled(socket, urls, options))
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

	isInstalled(socket, urls, options) {
		urls.forEach(url => {
			Phantom.getResponse(socket, url, options);
		});
	},

	getResponse(socket, url, options) {
		let phantom = Phantom.getSpawnCommand(url, options),
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

	getSpawnCommand(url, options) {
		let phantomPath = [ '.', 'lib', 'phantom', 'phantom.js' ],
			phantomPathResolved = path.resolve.apply(path, phantomPath),
			argsOptions = Phantom.getSpawnOptions(options),
			phantomArgs = argsOptions.concat([ phantomPathResolved, url ]);

		return spawn('phantomjs', phantomArgs);
	},

	getSpawnOptions(options) {
		if(!options) {
			return [];
		}


		let spawnOptions = [];
		spawnOptions = spawnOptions.concat(Phantom.getProxyAddress(options));
		spawnOptions = spawnOptions.concat(Phantom.getProxyAuth(options));
		return spawnOptions;
	},

	getProxyAddress(options) {
		if(!options.proxyAddress) {
			return [];
		}
		let port = `:${options.proxyPort}` || '';
		return `--proxy=${options.proxyAddress}${port}`;
	},

	getProxyAuth(options) {
		if(!options.proxyUsername || !options.proxyPassword) {
			return [];
		}
		return `--proxy-auth=${options.proxyUsername}:${options.proxyPassword}`;
	},

	success(socket, data) {
		socket.emit('phantom', data);
	},

	error(socket, err) {
		socket.emit('phantom-error', err);
	}
};

module.exports = Object.create(Phantom);
