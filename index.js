var browsers = {
	firefox: require('./lib/firefox')
};

/**
  Attempts to discover information about a browser with given release options

  releaseOpts:
    channel
    platform
    lang
 **/
exports.discover = function(family, releaseOpts, callback) {
	var browser = browsers[family];
	if (!browser) return callback('Unsupported browser detection');
	return browser(releaseOpts, callback);
};