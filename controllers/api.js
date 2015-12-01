var express = require('express');
var router = express.Router();
var passport = require('passport');
var util = require('util');
var crypto = require('crypto');
var uuid = require('node-uuid');
var dbManager = require('../models/db-manager.js');
var User = require('../models/user.js');
var ApiUser = require('../models/api-user.js');
var secretToken = crypto.randomBytes(32).toString('hex');
var async = require('async');

router.get('/', function(req, res, next) {
	res.render('api-home', { user: req.user, message: req.flash('apiError') });
});

router.get('/stats/:username', function(req, res, next) {
	dbManager.getUser(req.params.username, function(err, user) {
		if(err) {
			return res.send(err);
		}

		if(!user) {
			return res.send('No user with that username found.');
		}

		res.json(user.stats);
	});
});

router.post('/users', function(req, res, next) {
	console.log(req.body);
	var newApiUser = { username: req.body.username, password: req.body.password };
	dbManager.getApiUser(newApiUser.username, function(err, apiUser) {
		if(err) {
			return res.send(err);
		}

		if(apiUser) {
			return res.send('An API user with that username already exists.');
		}

		dbManager.createApiUser(newApiUser, function(err) {
			if(err) {
				return res.send(err);
			}

			return res.send('API user successfully created.');
		});
	});
});

// Updates stats for a given user
router.put('/stats/:username', isAuthorized, function(req, res, next) {
	async
		.waterfall([
			function(done) {
				dbManager.getUser(req.params.username, function(err, user) {
					if(!user) {
						var message = 'User with username "' + req.params.username + '" was not found';
						return done({ message: message }, null);
					}

					done(err, user);
				});
			},
			function(user, done) {
				var newStats = {};
				var battleWon = (req.body.battleWon == 'true' || req.body.battleWon) ? true : false;

				if(isNaN(req.body.kills) || isNaN(req.body.deaths)) {
					res.status(400);
					var err = { message: 'Inputted data was not properly formatted', status: 400 }; 
					return done(err);
				}

				newStats.kills = parseInt(req.body.kills);
				newStats.deaths = parseInt(req.body.deaths);
				newStats.battleWon = battleWon;

				done(err, user, newStats);
			},
			function(user, newStats, done) {
				user.stats = {
					kills: user.stats.kills + newStats.kills,
					deaths: user.stats.deaths + newStats.deaths,
					wins: (newStats.battleWon ? user.stats.wins + 1 : user.stats.wins),
					losses: (newStats.battleWon ? user.stats.losses : user.stats.losses + 1)
				}

				dbManager.updateUser(user, function(err) {
					if(err) {
						return done(err);
					}

					var message = 'Stats successfully updated for ' + req.params.username;
					done(null, message);
				});
			}
		], function(err, result) {
			if(err) {
				console.log('Caught error');
				console.log(err);
				return res.send(err);
			}

			console.log(result);
			res.status(200);
			return res.send(result);
		});
	// dbManager.getUser(req.params.username, function(err, user) {
	// 	var newStats = {};
	// 	var battleWon = (req.body.battleWon == 'true' || req.body.battleWon) ? true : false;

	// 	try {
	// 		if(isNaN(req.body.kills) || isNaN(req.body.deaths)) {
	// 			console.log('Improper format');
	// 			res.status(400);
	// 			throw { message: 'Inputted data was not properly formatted', status: 400 };
	// 		}
	// 		newStats.kills = parseInt(req.body.kills);
	// 		newStats.deaths = parseInt(req.body.deaths);
	// 		console.log('Kills: ' + newStats.kills);
	// 		console.log('Deaths: ' + newStats.deaths);
	// 		// if(isNaN(newStats.kills) || isNaN(newStats.deaths)) {
	// 		// 	res.status(400);
	// 		// 	throw { message: 'Inputted data was not properly formatted' };
	// 		// }
	// 	}
	// 	catch(ex) {
	// 		console.log('Exception caught');
	// 		console.log('Status: ' + ex.status || 500);
	// 		res.status(ex.status || 500);
	// 		// return res.send('Stats unsuccessfully updated for ' + req.params.username + '\nReason: ' + ex.message);
	// 		res.send('Stats unsuccessfully updated for ' + req.params.username + '\nReason: ' + ex.message);
	// 		next();
	// 	}

	// 	user.stats = {
	// 		kills: user.stats.kills + newStats.kills,
	// 		deaths: user.stats.deaths + newStats.deaths,
	// 		wins: (battleWon ? user.stats.wins + 1 : user.stats.wins),
	// 		losses: (battleWon ? user.stats.losses : user.stats.losses + 1)
	// 	}

	// 	// res.status(200);
	// 	// res.send('okay');
	// 	dbManager.updateUser(user, function(err) {
	// 		if(err) {
	// 			res.status(500);
	// 			return res.send(err);
	// 		}

	// 		res.status(200);
	// 		res.send('Stats successfully updated for ' + req.params.username);
	// 	});
	// });
});


// Check if request has authorizations to access certain parts of the api
function isAuthorized(req, res, next) {
	console.log('Before it all req headers: ' + req.headers['authorization']);
	if(req.headers['authorization']) {
		console.log('Authorized');
		var auth = req.headers['authorization'].split(' ')[1];
		// console.log(auth);
		var buf = new Buffer(auth, 'base64');
        var plain_auth = buf.toString(); 
        var username = plain_auth.split(':')[0];
        var pass = plain_auth.split(':')[1];

        async
        	.waterfall([
        		function(done) {
        			dbManager.getApiUser(username, function(err, apiUser) {
        				if(err) {
        					done(err);
        				}

        				if(apiUser) {
        					if(apiUser.validPassword(pass)) {
        						done(null, apiUser);
        					}

        					done({ status: 401, message: 'Invalid credentials' });
        				}
        				else {
        					done({ status: 401, message: 'Invalid credentials' });
        				}
        			});
        		}
        	], function(err, result) {
        		if(err) {
        			console.log('Error while authorizing');
	        		res.status(err.status || 500);
	        		return res.send(err);
        		}

        		console.log('No error authorizing');
        		return next();
        	});

        // dbManager.getApiUser(username, function(err, apiUser) {
        // 	if(err) {
        // 		res.status(500);
        // 		return res.send(err);
        // 	}

        // 	if(apiUser) {
        // 		if(apiUser.validPassword(pass)) {
        // 			console.log('Valid API password');
        // 			return next();
        // 		}
        // 	}

        // 	res.status(401);
        // 	return res.send('Your credentials are invalid.');
        // });
	}
	else {
		console.log('Not authorized');
		res.status(403);
		res.send('You are not authorized to use this part of the API.');
	}
	// Headers might be reset which might cause this conditional to be true?
}

function getApiUser(username) {
	dbManager.getApiUser(username, function(err, apiUser) {

	});
}

module.exports = router;