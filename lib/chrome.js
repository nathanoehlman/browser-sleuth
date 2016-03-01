var request = require('request');
var os = require('os');

var PLATFORM_MAPPINGS = {
  darwin: 'mac',
  linux: 'linux',
  win32: 'win',
  osx: 'mac'
};

var CHANNEL_MAPPINGS = {
  experimental: 'canary',
  unstable: 'dev',
  stable: 'stable',
  beta: 'beta',
  dev: 'dev',
  nightly: 'canary',
  esr: undefined
};

// Handlers for determining how to structure links for various downloads
var CHANNEL_LINKS = {
  'mac-canary': 'https://dl.google.com/release2/q/canary/googlechrome.dmg',
  'mac-unstable': 'https://dl.google.com/chrome/mac/dev/GoogleChrome.dmg',
  'linux-dev': 'https://dl.google.com/linux/direct/google-chrome-unstable_current_amd64.deb',
  'mac': function(channel, version) { return 'https://dl.google.com/chrome/mac/' + channel + '/GoogleChrome.dmg'; },
  'linux': function(channel, version) { return 'https://dl.google.com/linux/direct/google-chrome-' + channel + '_current_amd64.deb'; }
};

var detectedPlatform = PLATFORM_MAPPINGS[os.platform()];

function getVersionInformation(channel, platform, callback) {
  request('http://omahaproxy.appspot.com/all/json', { json: true }, function(err, response, body) {
    if (err) return callback(err);
    var applicable = body.filter(function(r) { return r.os === platform; });
    if (!applicable || applicable.length === 0) return callback();

    var result = applicable[0].versions.filter(function(v) { return v.channel === channel; });
    return callback(null, (result.length > 0 ? result[0] : null));
  })
}

function getDownloadLink(platform, channel, version) {
  // See if we have a specialised download link format
  var linkHandler = CHANNEL_LINKS[platform + '-' + channel] || CHANNEL_LINKS[platform] || CHANNEL_LINKS['default'];
  if (!linkHandler) return '';
  return (typeof linkHandler === 'function' ? linkHandler(channel, version) : linkHandler);
}

module.exports = function(opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  opts = opts || {};

  var channel = opts.channel || 'stable';
  var chromeChannel = CHANNEL_MAPPINGS[channel];
  if (!chromeChannel) return callback('Unknown channel');
  var platform = PLATFORM_MAPPINGS[opts.platform] || opts.platform || detectedPlatform;

  getVersionInformation(chromeChannel, platform, function(err, info) {
    if (err) return callback(err);
    if (!info) return callback();
    return callback(null, {
      family: 'chrome',
      channel: channel,
      providerChannel: chromeChannel,
      platform: platform,
      version: info.version,
      filename: '',
      download: getDownloadLink(platform, chromeChannel, info.version)
    });
  });
};