#!/usr/bin/env node
var os = require('os');
var sleuth = require('./');
var args = process.argv.slice(2);

if (args.length === 0) return;

sleuth.discover(args[0], {
	channel: (args.length > 1 ? args[1] : undefined),
	platform: (args.length > 2 ? args[2] : os.platform())
}, function(err, info) {
	if (err || !info) return;

	console.log('%s|%s|%s|%s', info.family, info.channel, info.version, info.download);
});
