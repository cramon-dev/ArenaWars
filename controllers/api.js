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
	dbManager.getUser(req.params.username, function(err, user) {
		var newStats = {};
		var battleWon = (req.body.battleWon == 'true' || req.body.battleWon) ? true : false;

		try {
			newStats.kills = parseInt(req.body.kills);
			newStats.deaths = parseInt(req.body.deaths);
			if(isNaN(newStats.kills) || isNaN(newStats.deaths)) {
				throw { message: 'Inputted data was not properly formatted' };
			}
		}
		catch(ex) {
			return res.send('Stats unsuccessfully updated for ' + req.params.username + '\nReason: ' + ex.message);
		}

		user.stats = {
			kills: user.stats.kills + newStats.kills,
			deaths: user.stats.deaths + newStats.deaths,
			wins: (battleWon ? user.stats.wins + 1 : user.stats.wins),
			losses: (battleWon ? user.stats.losses : user.stats.losses + 1)
		}

		dbManager.updateUser(user, function(err) {
			if(err) {
				res.status(500);
				return res.send(err);
			}

			res.send('Stats successfully updated for ' + req.params.username);
		});
	});
});


// Check if request has authorizations to access certain parts of the api
function isAuthorized(req, res, next) {
	if(req.headers['authorization']) {
		var auth = req.headers['authorization'].split(' ')[1];
		var buf = new Buffer(auth, 'base64');
        var plain_auth = buf.toString(); 
        var username = plain_auth.split(':')[0];
        var pass = plain_auth.split(':')[1];

        dbManager.getApiUser(username, function(err, apiUser) {
        	if(err) {
        		res.status(500);
        		return res.send(err);
        	}

        	if(apiUser) {
        		if(apiUser.validPassword(pass)) {
        			console.log('Valid API password');
        			return next();
        		}
        	}

        	res.status(401);
        	return res.send('Your credentials are invalid.');
        });
	}
	else {
		res.status(403);
		res.send('You are not authorized to use this part of the API.');
	}
}

module.exports = router;