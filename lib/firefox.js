var request = require('request');
var os = require('os');
var reFilename = /^.*((?:Firefox |firefox-)[0-9\.ba]+\..*[exe|dmg|tar.bz2]).*/;
var reVersion = /^.*(?:Firefox |firefox-)([0-9\.ba]+)\..*[exe|dmg|tar.bz2]$/;

var PLATFORM_MAPPINGS = {
	darwin: 'osx',
	linux: 'linux64',
	win32: 'win'
};

var CHANNEL_MAPPINGS = {
	experimental: undefined,
	stable: 'latest',
	beta: 'beta-latest',
	dev: 'nightly-latest',
	esr: 'esr-latest',
	unstable: 'nightly-latest'
};

var detectedPlatform = PLATFORM_MAPPINGS[os.platform()];

function getDownloadURL(channel, platform, lang) {
	return 'https://download.mozilla.org/?os=' + platform + '&lang=' + lang + '&product=firefox-' + (channel || 'latest');
}

function applyRegex(regex, value) {
	var results = regex.exec(value || '');
	return (results.length > 1 ? results[1] : '');
}

module.exports = function(opts, callback) {
	if (!callback && typeof opts === 'function') {
		callback = opts;
		opts = {};
	}
	opts = opts || {};

	var channel = opts.channel || 'stable';
	var firefoxChannel = CHANNEL_MAPPINGS[channel];
	if (!firefoxChannel) return callback('Unknown channel');
	var platform = opts.platform || detectedPlatform;
	var lang = opts.lang || 'en-US';

	var downloadUrl = getDownloadURL(firefoxChannel, platform, lang);
	var req = request(downloadUrl);;
	var _responded = false;

	req.on('response', function(response) {
		if (!response.statusCode || response.statusCode !== 200) return callback('Unable to get information for Firefox ' + channel);

		// Get information from the request href
		var targetPath = decodeURIComponent(response.request.uri.href);
		var fileName = applyRegex(reFilename, targetPath);
		var version = applyRegex(reVersion, fileName);

		// Abort the download
		req.abort();

		responded = true;
		return callback(null, {
			family: 'firefox',
			channel: channel,
			providerChannel: firefoxChannel,
			platform: platform,
			version: version,
			filename: fileName,
			download: targetPath
		});
	})
	.on('error', function(err) {
		if (responded) return;
		return callback(err);
	});
};