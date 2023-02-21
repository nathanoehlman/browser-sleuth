var async = require('async');
var should = require('chai').should();
var sleuth = require('..');

describe('Chrome sleuthing', function() {

	it('should be able to discover channel releases', function(done) {
		this.timeout(10000);

		var channels = ['stable', 'beta', 'dev'];
		async.forEach(
			channels,
			function(channel, done) {
				sleuth.discover('chrome', {
					channel: channel
				}, function(err, info) {
					if (err || !info) return done(err || 'No result found');

					info.family.should.equal('chrome');
					info.channel.should.equal(channel);
					info.download.should.be.ok;
					return done();
				});
			}, function(err) {
				return done(err);
			}
		);
	});

	it('should use the correct URL for canary on mac', function(done) {
		sleuth.discover('chrome', {
            platform: 'mac',
			channel: 'nightly'
		}, function(err, info) {
			if (err || !info) return done(err || 'No result found');
			info.download.should.equal('https://dl.google.com/release2/q/canary/googlechrome.dmg');
			return done();
		});
	})
});
