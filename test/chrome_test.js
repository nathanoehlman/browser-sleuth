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
					return done();
				});
			}, function(err) {
				return done(err);
			}
		);
	});
});